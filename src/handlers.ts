import { FastifyRequest, FastifyReply } from "fastify";
import { PokemonWithStats } from "models/PokemonWithStats";
const axios = require('axios')

export async function getPokemonByName(request: FastifyRequest, reply: FastifyReply) {
  var name: string = request.params['name']

  reply.headers['Accept'] = 'application/json'

  var urlApiPokeman = `https://pokeapi.co/api/v2/pokemon/`;

  var params = {}

  name != null
      ? 
      (name.trim() != ''
        ? (params["name"] = name.trim(), urlApiPokeman += name)
        : (urlApiPokeman += "?offset=20&limit=20")
      )
      : (urlApiPokeman += "?offset=20&limit=20")

  let response: any = ""

  await axios
    .get(urlApiPokeman)
    .then((res) =>{
      // console.log('Response from api ==>', res.data)
      response = res.data
    }
    )
    .catch((err) => {
      // console.log('Error while requesting the api ==>', err)
      reply.code(404)
    })
  // console.log('Response ==>', response)
  let pokemonData = await computeResponse(response, reply)
  
  reply.send(pokemonData)

  console.log('Query excecuted!!')
  return reply
  
}

export const computeResponse = async (response: any, reply: FastifyReply) => {
  
  let types=[]
  types = response.types.map(type => type.type.url)
  // console.log('Types ==>', types)
  let pokemonTypes = []

  for (let i = 0; i < types.length; i++) {
    let typeUrl = types[i]
    await axios
      .get(typeUrl)
      .then((res) =>{
        // console.log('Response from api ==>', res.data);
        pokemonTypes.push(...res.data.pokemon);
      }
      )
      .catch((err) => {
        console.log('Error while requesting the api ==>', err)
      })
  }

  if (pokemonTypes == undefined)
    throw pokemonTypes

  // console.log("pokemonTypes ==>", pokemonTypes)
  //get data for each pokemon in the list "pokemonTypes" using microservices principle
  var queryPromises=[]
  var pokemonTypesWithStats: PokemonWithStats[] = [];
  for (let i = 0; i < pokemonTypes.length; i++) {
    const pokemonTemp = pokemonTypes[i]
    console.log('url', pokemonTemp.pokemon.url)
    //i store all the queries in a varible
    const query = axios
                    .get(pokemonTemp.pokemon.url)
    queryPromises.push(query);
  }

  //i wait for the queries excecution
  Promise.all(queryPromises).then((values) => {
    values.forEach(value => {
      pokemonTypesWithStats.push(new PokemonWithStats(value.data));
      // console.log('list of pokemons',pokemonTypesWithStats)
      response.stats.forEach(element => {
        var stats = []
        pokemonTypesWithStats.map(pok => {
            pok.stats.map(st =>
              st.stat.name.toUpperCase() == element.stat.name.toUpperCase() && stats.push(st.base_stat) 
            )}
        )
    
        if (stats) {
          element.averageStat = stats.reduce((a, b) => a + b) / stats.length
        } else {
          element.averageStat = 0
        }
      });
    })
  })

  return response
}
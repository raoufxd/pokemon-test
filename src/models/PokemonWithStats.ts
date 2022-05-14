import { Species } from "./Species";
import { Stat } from "./Stat";

export class PokemonWithStats {
    name: String;
    height: number;
    base_experience: number;
    id: number;
    sprite_img: string;
    species: Species;
    stats: Array<Stat>
    constructor(pokemon: any) { 
        this.name = pokemon.name;
        this.height = pokemon.height
        this.base_experience = pokemon.base_experience
        this.id = pokemon.id
        this.species = pokemon.species
        this.stats = pokemon.stats
    }
} 
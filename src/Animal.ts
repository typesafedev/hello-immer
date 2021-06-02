// Animal is a recursive type.
// We need a 3 level hierarchy to demonstate the power of either lenses or immer 
export type Animal = {
    name: string,
    type: string,
    pets: Animal[],
    friends: Animal[],
    father?: Animal
}

export const make = (name: string, type: string, father?: Animal, pets: Animal[] = [], friends: Animal[] = []) => (
{
    name,
    type,
    pets,
    friends,
    father
})

export const jaz: Animal = make("Jaz", "human")
export const elodie: Animal = make("Elodie", "human")
export const joanne: Animal = make("Joanne", "human", undefined, [], [ jaz, elodie ])

export const mikey: Animal = make("Mikey", "dinasaur")
export const casey: Animal = make("Casey", "human")
export const rocky: Animal = make("Rocky", "dog")
export const wally: Animal = make("Wally", "human", undefined, [ rocky ])
export const fred: Animal = make("Fred", "human")
export const denver: Animal = make("Denver", "dinasaur", mikey, [], [ wally, casey ])

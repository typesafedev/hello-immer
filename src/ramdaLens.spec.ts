
import { lensProp, view, set, over, lensPath, compose } from "ramda"
import { Expect, Test, TestFixture } from "alsatian"
import { denver, Animal, fred, rocky, joanne } from "./Animal"

const friendsLens = lensProp("friends")

@TestFixture("ramda lens tests")
export class ramdaLensTests {
    @Test("view data with lens")
    public viewLensTest() {
        Expect(view(friendsLens, denver)).toBe(denver.friends)
    }

    @Test("lenses are first class view")
    public viewLensFirstClassTest() {
        // Lenses are first class and can passed and invoked like any other object/function.
        const joanneFriends = view(friendsLens, joanne)
        Expect(joanneFriends).toBe(joanne.friends)
    }

    @Test("lenses are first class map")
    public viewLensFirstClassMapTest() {
        // Lenses are 1st class so Array.map works
        const animals = [ denver, joanne ]
        const animalsFriends = animals.map(a => view(friendsLens, a))
        Expect(animalsFriends).toContain(denver.friends)
        Expect(animalsFriends).toContain(joanne.friends)
    }

    @Test("lenses should be first class compose")
    public viewLensFirstClassComposeTest() {
        // Lenses are 1st class so composition should work. 
        // Unfortunately, ramda lens composition does not preserve the entire Lens structure in TS
        const nameLens = lensProp("name")
        const fatherLens = lensProp("father")
        const fathersNameLens = compose(nameLens, fatherLens) // oops, we get getter of lens but lose the setter so ff type errs
        // Expect(view(fathersNameLens, denver)).toBe(denver.father.name)
    }

    @Test("set data using lens")
    public setLensTest() {
        const denverNoFriends = set(friendsLens, [], denver)
        Expect(view(friendsLens, denverNoFriends)).toBe(denverNoFriends.friends)
    }

    @Test("lenses are first class and can be set")
    public setLensFirstClassTest() {
        const joanneNoFriends = set(friendsLens, [], joanne)
        Expect(view(friendsLens, joanneNoFriends)).toBe(joanneNoFriends.friends)
    }
    @Test("modifyDataOverLens")
    public overLensTest() {
        const addFriend = (newFriend: Animal) => (friends: Animal[]) => [ ...friends, newFriend ]
        // mutate with map "over"
        const denverWithNewFriend = over(friendsLens, addFriend(fred), denver);
        Expect(denver.friends).not.toContain(fred)
        Expect(denverWithNewFriend.friends).toContain(fred)
    }

    @Test("viewDeepNestedDataUsingLens")
    public viewDeepPropAndIndexLensTest() {
        // This is where lenses really shines where you have to focus on a deeply nested structure
        const friends0pets0nameLens = lensPath(["friends", 0, "pets", 0, "name"])
        const name = view(friends0pets0nameLens, denver)
        Expect(name).toBe(rocky.name);
    }

    @Test("setDeepNestedDataUsingLens")
    public setDeepPropAndIndexLensTest() {
        // change denver's 1st friend's 1st pet's name to "Spot"
        const friends0pets0nameLens = lensPath(["friends", 0, "pets", 0, "name"])
        const denverChanged = set(friends0pets0nameLens, "Spot", denver)
        Expect(denverChanged.friends[0].pets[0].name).toBe("Spot")
    }

    @Test("modifyDeepNestedDataOverLens")
    public overDeepPropAndIndexLensTest() {
        const setName = (name: string) => () => name
        // change denver's 1st friend's 1st pet's name to "Spot"
        const friends0pets0nameLens = lensPath(["friends", 0, "pets", 0, "name"])
        const denverChanged = over(friends0pets0nameLens, setName("Spot"), denver)
        Expect(denverChanged.friends[0].pets[0].name).toBe("Spot")
    }
}
import { produce } from "immer"
import { Expect, Test, TestFixture } from "alsatian"
import { denver, Animal, fred, rocky } from "./Animal"
import { always } from "ramda"

@TestFixture("ramda lens tests")
export class ramdaLensTests {
    @Test("viewDataWithProduce")
    public viewLensTest() {
        const noop = always(undefined);
        Expect(produce(denver, noop).friends).toBe(denver.friends)
    }

    @Test("setDataWithProduce")
    public setDataTest() {
        const setNoFriends = (animal: Animal) => produce(animal, draft => { draft.friends = []})
        const denverNoFriends = setNoFriends(denver)
        Expect(denverNoFriends.friends).toBeEmpty()
    }

    @Test("modifyDataWithProduce")
    public modifyDataTest() {
        const addFriend = (animal: Animal, newFriend: Animal) => produce(animal, draft => {
            draft.friends.push(newFriend)
        })
        const denverWithNewFriend = addFriend(denver, fred);
        Expect(denver.friends).not.toContain(fred)
        Expect(denverWithNewFriend.friends).toContain(fred)
    }

    @Test("viewDeepNestedDataWithProduce")
    public viewDeepPropAndIndexTest() {
        const name = denver.friends[0].pets[0].name
        Expect(name).toBe(rocky.name);
    }

    @Test("setDeepNestedDataWithProduce")
    public setDeepPropAndIndexProduceTest() {
        // change denver's 1st friend's 1st pet's name to "Spot"
        const changeName = (animal: Animal, newName: string) => produce(animal, draft => {
            draft.friends[0].pets[0].name = newName
        })
        const denverChanged = changeName(denver, "Spot")
        Expect(denverChanged.friends[0].pets[0].name).toBe("Spot")
    }

    @Test("setDeepNestedDataWithCurriedProduce")
    public setDeepPropAndIndexCurriedProduceTest() {
        
        const changeName = (animal: Animal, newName: string) => produce(animal, draft => {
            draft.friends[0].pets[0].name = newName
        })
        // Equivalent changeName using curried form of produce()
        const curriedChangeName = produce((draft: Animal, newName: string) => {
            draft.friends[0].pets[0].name = newName
        })
        const denverChanged = changeName(denver, "Spot")
        const denverCurried = curriedChangeName(denver, "Spot")
        
        Expect(denver.friends[0].pets[0].name).not.toBe(denverChanged.friends[0].pets[0].name)
        Expect(denverChanged.friends[0].pets[0].name).toBe(denverCurried.friends[0].pets[0].name)
        Expect(denverChanged.friends[0].pets[0].name).toBe("Spot")
        Expect(denverCurried.friends[0].pets[0].name).toBe("Spot")
    }
}
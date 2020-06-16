import { TestFixture, Test, Expect } from "alsatian";
import { denver, fred, rocky } from "./Animal";

// const prevents re-assignment not mutation!
@TestFixture("native spread tests")
export class nativeSpreadTests {
    @Test("viewData")
    public viewTest() {
        Expect(denver.friends).toBe(denver.friends)
    }

    @Test("setData")
    public setTest() {
        const denverNoFriends = { ...denver, friends: []}
        Expect(denverNoFriends.friends).toBeEmpty()
    }

    @Test("modifyData")
    public modifyTest() {
        const denverWithNewFriend = {
            ...denver,
            friends: [ ...denver.friends, fred]
        }
        Expect(denver.friends).not.toContain(fred)
        Expect(denverWithNewFriend.friends).toContain(fred)
    }

    @Test("viewDeepNestedData")
    public viewDeepPropAndIndexTest() {
        const name = denver.friends && 
            denver.friends[0] &&
            denver.friends[0].pets &&
            denver.friends[0].pets[0] && 
            denver.friends[0].pets[0].name
        Expect(name).toBe(rocky.name);
    }

    @Test("setDeepNestedData - this is where native spread syntax starts to break down")
    public setDeepPropAndIndexLensTest() {
        // change denver's 1st friend's 1st pet's name to "Spot"
        const denverChanged = {
            ...denver, 
            friends: [
                {
                    ...denver.friends[0],
                    pets: [ {...denver.friends[0].pets[0], name: "Spot" } ]
                },
                ...denver.friends.slice(1)
            ]
        }
        Expect(denverChanged.friends[0].pets[0].name).toBe("Spot")
    }
}
import { Expect, Test, TestFixture } from "alsatian"
import { restaurant } from "./restaurant"
import { produce, Draft } from "immer"


@TestFixture("restaurant tests")
export class RestaurantTests {

    @Test("spread creates mutable restaurant")
    public cloneRestaurantWithSpread() {
        const origRestaurant: restaurant = {
            name: "Fat Duck",
            address: {
                street: "Some Street",
                city: "Bray",
                postcode: "RG12 1AA"
            }
        }

        const modStreet = "High Street";
        const modRestaurant = { ...origRestaurant, address: { ...origRestaurant.address, street: modStreet } }
        Expect(modRestaurant.address.street).toBe(modStreet)

        const modStreet1 = "Main Street"
        modRestaurant.address.street = modStreet1
        Expect(modRestaurant.address.street).toBe(modStreet1)
        Expect(modRestaurant.address.street).not.toBe(modStreet)
    }

    @Test("immer produce creates immutable restaurant")
    public cloneRestaurantWithProduc() {
        const origStreet = "Some Street";
        const origRestaurant: restaurant = {
            name: "Fat Duck",
            address: {
                street: origStreet,
                city: "Bray",
                postcode: "RG12 1AA"
            }
        }

        const modStreet = "High Street";
        const modRestaurant = produce(origRestaurant, draft => {
          draft.address.street = modStreet  
        })
        // OrigRestaurant street is unmodified
        Expect(origRestaurant.address.street).toBe(origStreet)
        
        // ModRestaurant street is modified
        Expect(modRestaurant.address.street).toBe(modStreet)

        // Unchanged state is structurally shared. This is important for performance.
        Expect(origRestaurant.name).toBe(modRestaurant.name)

        // ModRestaurant is frozen so any attempt to change it type errors
        Expect(Object.isFrozen(modRestaurant))

        const modStreet1 = "Main Street"
        // Compile time TypeError: Cannot assign to read only property 'street' of object '#<Object>'
        // modRestaurant.address.street = modStreet1
    }

    @Test("immer curried producer")
    public curriedProducer() {
        const mapper = produce((draft: restaurant, city: string) => {
            draft.address.city = city
        });

        const restaurants = [{
            name: "Fat Duck",
            address: {
                street: "Main Street",
                city: "Bray",
                postcode: "RG12 1AA"
            }
        }, {
            name: "Waterside Inn",
            address: {
                street: "High Street",
                city: "Bray",
                postcode: "RG12 2BB"
            }
        }]

        const modRestaurants = restaurants.map(r => mapper(r, "Reading"))
        Expect(modRestaurants[0].address.city).toBe("Reading")
        Expect(modRestaurants[1].address.city).toBe("Reading")
    }

    @Test("immer force modify immutable prop")
    public draftProducer() {
        const origPostcode = "RG12 1AA";
        // postcode prop is immutable(readonly) and should not be modifiable in normal ts/js operation
        const origRestaurant: restaurant = {
            name: "Fat Duck",
            address: {
                street: "Some Street",
                city: "Bray",
                postcode: origPostcode
            }
        }

        // Use the Draft utility type to modify immutable type
        const modifyPostcode = produce((draft: Draft<restaurant>, postcode: string) => {
            draft.address.postcode = postcode
        })

        const modPostcode = "HP12 2BB"
        const modRestaurant = modifyPostcode(origRestaurant, modPostcode)

        Expect(modRestaurant.address.postcode).not.toBe(origPostcode)
        Expect(modRestaurant.address.postcode).toBe(modPostcode)
    }
}
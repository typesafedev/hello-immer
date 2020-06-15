import { john, Employee, Company, Address, Street } from "./Employee"
import { TestFixture, Test, Expect } from "alsatian";
import { Lens, Optional, Prism, fromTraversable, Iso } from "monocle-ts"
import { some, none, fold, toNullable, getOrElse, Option } from "fp-ts/lib/Option";
import { pipe, identity } from "fp-ts/lib/function";
import { array } from "fp-ts/lib/Array"
import { Animal } from "./Animal";

const capitalize = (s: string): string => s.substring(0, 1).toUpperCase() + s.substring(1)
const isCapital = (c: string): boolean => c === c.toUpperCase() && c !== c.toLowerCase()

// Modify using native spread op
const johnCapitalized = {
    ...john,
    company: {
        ...john.company,
        address: {
            ...john.company.address,
            street: {
                ...john.company.address.street,
                name: capitalize(john.company.address.street.name),
            },
        },
    },
};

@TestFixture("monocle ts tests")
export class monocleTsTests {

    @Test("Get deep nested prop with native ts")
    public getPropNative() {
        // Gets are easy with native ts
        Expect("high street").toEqual(john.company.address.street.name)
    }

    @Test("Get deep nested prop with lens")
    public getPropLens() {
        // Gets are more complex but they have a virtue of being 1st class and can be passed around
        const company = Lens.fromProp<Employee>()("company")
        const address = Lens.fromProp<Company>()("address")
        const street = Lens.fromProp<Address>()("street")
        const name = Lens.fromProp<Street>()("name")
        const nestedName = company
            .compose(address)
            .compose(street)
            .compose(name)
        Expect(nestedName.get(john)).toEqual(john.company.address.street.name)
    }

    @Test("Get deep nested prop with fromPath API")
    public getPropFromPathLens() {
        // fromPath simplifies lens creation for deeply nested props
        const name = Lens.fromPath<Employee>()([ "company", "address", "street", "name" ])
        Expect(name.get(john)).toEqual(john.company.address.street.name)
    }

    @Test("Capitalize deep nested prop with native ts")
    public capitalizePropNative() {
        // Look at how johnCapitalized is created. Spread op is clumsy for deeply nested structure.
        Expect(johnCapitalized.company.address.street.name.substring(0, 1)).not.toBe(john.company.address.street.name.substring(0, 1))
        Expect(isCapital(johnCapitalized.company.address.street.name.substring(0, 1)))
    }

    @Test("Capitalize deep nested prop with monocle ts lens")
    public capitalizePropLens() {
        // Lenses are 1st class.
        // Individual lenses can be composed together to form a complex lens 
        const company = Lens.fromProp<Employee>()("company")
        const address = Lens.fromProp<Company>()("address")
        const street = Lens.fromProp<Address>()("street")
        const name = Lens.fromProp<Street>()("name")
        const capitalizeName = company
            .compose(address)
            .compose(street)
            .compose(name)
            .modify(capitalize)

        Expect(johnCapitalized).toEqual(capitalizeName(john))
        Expect(isCapital(capitalizeName(john).company.address.street.name.substring(0, 1)))
    }

    @Test("Capitalize deep nested prop with Lens.fromPath API to avoid boilerplate")
    public capitalizeFromPath() {
        const name = Lens.fromPath<Employee>()(["company", "address", "street", "name"])
        const capitalizeName = name.modify(capitalize)

        Expect(johnCapitalized).toEqual(capitalizeName(john))
        Expect(isCapital(capitalizeName(john).company.address.street.name.substring(0, 1)))
    }

    @Test("get with optional props getOrElse ")
    public getOptionalNameGetOrElse() {
        const company = Lens.fromProp<Employee>()("company")
        const address = Lens.fromProp<Company>()("address")
        const street = Lens.fromProp<Address>()("street")
        const name = Lens.fromProp<Street>()("name") // Street name can be ""
        const optionalName = company
            .compose(address)
            .compose(street)
            .compose(name)
            .asOptional() 
        
        const onNoneReturnEmptyString = () => ""
        Expect(getOrElse(onNoneReturnEmptyString)(optionalName.getOption(john))).toEqual(john.company.address.street.name)
    }

    
    @Test("get with optional props fold ")
    public getOptionalNameFold() {
        const company = Lens.fromProp<Employee>()("company")
        const address = Lens.fromProp<Company>()("address")
        const street = Lens.fromProp<Address>()("street")
        const name = Lens.fromProp<Street>()("name") // Street name can be ""
        const optionalName = company
            .compose(address)
            .compose(street)
            .compose(name)
            .asOptional() 

        const onNoneReturnEmptyString = () => ""    
        const streetName = fold(onNoneReturnEmptyString, identity)(optionalName.getOption(john))
        Expect(streetName).toEqual(john.company.address.street.name)     
        Expect(getOrElse(onNoneReturnEmptyString)(optionalName.getOption(john))).toEqual(john.company.address.street.name)
    }

    @Test("get with optional props pipe")
    public getOptionalNamePipe() {
        const company = Lens.fromProp<Employee>()("company")
        const address = Lens.fromProp<Company>()("address")
        const street = Lens.fromProp<Address>()("street")
        const name = Lens.fromProp<Street>()("name") // Street name can be ""
        const optionalName = company
            .compose(address)
            .compose(street)
            .compose(name)
            .asOptional() 

        const streetName = pipe(optionalName.getOption(john), toNullable)
        Expect(streetName).toEqual(john.company.address.street.name) 
    }

    @Test("get with optional props compose using prism")
    public getOptionalNamePrism() {
        const company = Lens.fromProp<Employee>()("company")
        const address = Lens.fromProp<Company>()("address")
        const street = Lens.fromProp<Address>()("street")
        const optionalName = Lens.fromProp<Street>()("optionalName").composePrism(Prism.some<string>())
        const name = company.compose(address).compose(street).composeOptional(optionalName)

        const toEmptyString = (optString: Option<string>) => getOrElse(() => "")(optString)
        const streetName = toEmptyString(name.getOption(john))
        Expect(streetName).toEqual(toEmptyString(john.company.address.street.optionalName))
        Expect(toEmptyString(john.company.address.street.optionalName)).toEqual(streetName) 
    }

    @Test("Capitalize with optional props")
    public capitalizeOptionalName() {
        const firstCharacterOptional = new Optional<string, string>(
            s => (s.length > 0 ? some(s[0]) : none),
            a => s => (s.length > 0 ? a + s.substring(1) : s)
          )
        const company = Lens.fromProp<Employee>()("company")
        const address = Lens.fromProp<Company>()("address")
        const street = Lens.fromProp<Address>()("street")
        const name = Lens.fromProp<Street>()("name") // Street name can be "", in which case 1st char is optional
        const firstLetter = company
            .compose(address)
            .compose(street)
            .compose(name)
            .asOptional()
            .compose(firstCharacterOptional)
        const johnCapitalizeOptional = firstLetter.modify(s => s.toUpperCase())(john)
        
        Expect(johnCapitalizeOptional).toEqual(johnCapitalized)
    }

    @Test("Traversal")
    public traversal() {
        const friends = Lens.fromProp<Animal>()("friends")
        const name = Lens.fromProp<Animal>()("name")
        const friendTraversal = fromTraversable(array)<Animal>()
        const composedTraversal = friends.composeTraversal(friendTraversal).composeLens(name)
        
        const a0: Animal = { name: "A0", type: "elephant", pets: [], friends: [] }
        const a1: Animal = { name: "A1", type: "giraffe", pets: [], friends: [] }
        const a2: Animal = { name: "A2", type: "hippo", pets: [], friends: [] }
        const leo: Animal = { name: "Leo", type: "lion", friends: [ a0, a1, a2 ], pets: [] } 

        const leoWithReversedName = composedTraversal.modify((name) => name.split("").reverse().join(""))(leo)
        Expect(leoWithReversedName.friends[0].name).toEqual("0A")
        Expect(leoWithReversedName.friends[1].name).toEqual("1A")
        Expect(leoWithReversedName.friends[2].name).toEqual("2A")
    }

    @Test("Traversal set")
    public traversalSet() {
        const friends = Lens.fromProp<Animal>()("friends")
        const name = Lens.fromProp<Animal>()("name")
        const friendTraversal = fromTraversable(array)<Animal>()
        const composedTraversal = friends.composeTraversal(friendTraversal).composeLens(name)
        
        const a0: Animal = { name: "A0", type: "elephant", pets: [], friends: [] }
        const a1: Animal = { name: "A1", type: "giraffe", pets: [], friends: [] }
        const a2: Animal = { name: "A2", type: "hippo", pets: [], friends: [] }
        const leo: Animal = { name: "Leo", type: "lion", friends: [ a0, a1, a2 ], pets: [] } 

        const leoWithJohns = composedTraversal.set("John")(leo)
        Expect(leoWithJohns.friends[0].name).toEqual("John")
        Expect(leoWithJohns.friends[1].name).toEqual("John")
        Expect(leoWithJohns.friends[2].name).toEqual("John")
    }

    @Test("Traversal filter")
    public traversalFilter() {
        const friends = Lens.fromProp<Animal>()("friends")
        const name = Lens.fromProp<Animal>()("name")
        const friendTraversal = fromTraversable(array)<Animal>()
        const composedTraversal = friends.composeTraversal(friendTraversal).composeLens(name)
        
        const a0: Animal = { name: "A0", type: "elephant", pets: [], friends: [] }
        const a1: Animal = { name: "A1", type: "giraffe", pets: [], friends: [] }
        const a2: Animal = { name: "A2", type: "hippo", pets: [], friends: [] }
        const leo: Animal = { name: "Leo", type: "lion", friends: [ a0, a1, a2 ], pets: [] } 

        // When traversing, we're interested in leo's friend called "A2" who happens to be a hippo
        const leoFriend2Traversal = composedTraversal.filter((name) => name == "A2")

        const leoRenamedFriend  = leoFriend2Traversal.set("A2Renamed")(leo)
        const hippo = leoRenamedFriend.friends.filter(f => f.type === "hippo")[0]
        Expect(hippo.name).toEqual("A2Renamed")
    }

    @Test("Iso are useful for faithful conversions")
    public iso() {
        const fToC = new Iso<number, number>(
            (f) => (f - 32) / 1.8,
            (c) => (1.8 * c) + 32,
        )
        
        Expect(fToC.get(32)).toEqual(0)
        Expect(fToC.reverseGet(0)).toEqual(32)
    }

    @Test("Iso compose")
    public isoCompose() {
        const usGallonToLiter = new Iso<number, number>(
            (g) => g * 3.78541,
            (l) => l / 3.78541,
        )
        const literToimperialGallon = new Iso<number, number>(
            (l) => l / 4.54609,
            (g) => g * 4.54609,
        )
        
        const usGallonToImperialGallonIso = usGallonToLiter.compose(literToimperialGallon)
        const usToImperial = (usGallon: number) => usGallonToImperialGallonIso.to(usGallon)
        const imperialToUs = (imperialGallon: number) => usGallonToImperialGallonIso.from(imperialGallon)

        Expect(usToImperial(1).toFixed(3)).toEqual(0.833)
        Expect(imperialToUs(1).toFixed(3)).toEqual(1.201)
    }
}

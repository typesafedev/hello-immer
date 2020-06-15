import { Option, none } from "fp-ts/lib/Option"

// Example object hierarchy from monocle-ts
type Street = {
    name: string
    num: number
    optionalName: Option<string>
}

type Address = {
    city: string
    street: Street
}

type Company = {
    name: string
    address: Address
}

type Employee = {
    name: string
    company: Company
}

const john: Employee = {
    name: "john",
    company: {
        name: "new orbit",
        address: {
            city: "oxford",
            street: {
                name: "high street",
                num: 12,
                optionalName: none
            }
        }
    }
}

export { Street, Address, Company, Employee, john }
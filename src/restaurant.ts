export type restaurantChain = {
    name: string
    address: address
}

export type restaurant = {
    name: string
    address: address
    chain?: restaurantChain
}

export type address = {
    street: string
    city: string
    readonly postcode: string
}

export const hesterCorp: restaurantChain = {
    name: "Hester Corp",
    address: {
        street: "Some Street",
        city: "Bray",
        postcode: "RG12 9ZZ"
    },
}

export const fatduck: restaurant = {
    name: "Fat Duck",
    address: {
        street: "Some Street",
        city: "Bray",
        postcode: "RG12 1AA"
    },
    chain: hesterCorp
}

export const watersideInn: restaurant = {
    name: "Waterside Inn",
    address: {
        street: "High Street",
        city: "Bray",
        postcode: "RG12 2BB"
    }
}
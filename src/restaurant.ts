export type restaurant = {
    name: string
    address: address
}

export type address = {
    street: string
    city: string
    readonly postcode: string
}
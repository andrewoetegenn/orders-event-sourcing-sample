export interface PlaceOrder {
    lineItems: [
        {
            sku: string;
            quantity: number;
            unitPrice: number;
        }
    ];
}

export interface AddLineItemToOrder {
    sku: string;
    quantity: number;
    unitPrice: number;
}

export interface PlaceOrderCommand {
    lineItems: [
        {
            sku: string;
            quantity: number;
            unitPrice: number;
        }
    ];
}

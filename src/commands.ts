export interface ICommand {}

export interface PlaceOrder extends ICommand {
    lineItems: [
        {
            sku: string;
            quantity: number;
            unitPrice: number;
        }
    ];
}

export interface AddLineItemToOrder extends ICommand {
    sku: string;
    quantity: number;
    unitPrice: number;
}

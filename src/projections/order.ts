export interface Order {
    orderId: string;
    orderStatus: OrderStatus;
    lineItems: OrderLineItem[];
}

export interface OrderLineItem {
    sku: string;
    quantity: number;
    unitPrice: number;
}

export enum OrderStatus {
    Placed = "Placed",
}

export interface Order {
    orderId: string;
    orderStatus: OrderStatus;
    lineItems: OrderLineItem[];
    orderTotal: number;
}

export interface OrderLineItem {
    sku: string;
    quantity: number;
    unitPrice: number;
}

export enum OrderStatus {
    Placed = "Placed",
    Approved = "Approved",
}

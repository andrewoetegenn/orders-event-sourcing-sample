import { round } from "./utils";

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
}

export const calculateOrderTotal = (lineItems: OrderLineItem[]): number => {
    return round(lineItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0));
};

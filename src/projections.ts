export interface OrderDetail {
    orderId: string;
    orderStatus: OrderStatus;
    lineItems: {
        sku: string;
        quantity: number;
        unitPrice: number;
    }[];
    payments: {
        paymentId: string;
        amount: number;
    }[];
    shipments: {
        shipmentId: string;
        carrier: string;
        carrierService: string;
    }[];
    orderTotal: number;
}

export enum OrderStatus {
    Placed = "Placed",
    Approved = "Approved",
    Paid = "Paid",
    Dispatched = "Dispatched",
    Delivered = "Delivered",
    Completed = "Completed",
}

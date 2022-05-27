import { IOrderEvent } from "../../order-event";

export class OrderPlaced implements IOrderEvent {
    readonly orderId: string;

    constructor(orderId: string) {
        this.orderId = orderId;
    }
}

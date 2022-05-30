export interface IEvent {}

export class OrderPlaced implements IEvent {
    readonly orderId: string;

    constructor(orderId: string) {
        this.orderId = orderId;
    }
}

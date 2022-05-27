import { Aggregate } from "../aggregate";
import { IEvent } from "../event";
import { OrderPlaced } from "./features/place-order/order-placed-event";
import { PlaceOrderCommand } from "./features/place-order/place-order-command";

export class Order extends Aggregate {
    private orderId: string;

    constructor(orderId: string) {
        super();
        this.placeOrder(orderId);
    }

    private placeOrder = (orderId: string) => {
        this.raiseEvent(new OrderPlaced(orderId));
    };

    private applyOrderPlaced = (event: OrderPlaced) => {
        this.orderId = event.orderId;
    };

    protected apply(event: IEvent) {
        switch (typeof event) {
            case typeof OrderPlaced:
                this.applyOrderPlaced(event as OrderPlaced);
            default:
                throw new Error(`No application found for event type ${typeof event}.`);
        }
    }
}

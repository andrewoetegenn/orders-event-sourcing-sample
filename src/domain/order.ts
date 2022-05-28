import { Aggregate } from "../core/aggregate";
import { IEvent } from "../core/event";
import { OrderPlaced } from "../events/order-placed-event";

export class Order extends Aggregate {
    public static place = (orderId: string) => {
        const order = new Order();
        order.raiseEvent(new OrderPlaced(orderId));
        return order;
    };

    private applyOrderPlaced = (event: OrderPlaced) => {
        this._aggregateId = event.aggregateId;
    };

    protected apply(event: IEvent) {
        switch (event.eventName) {
            case "OrderPlaced":
                this.applyOrderPlaced(event);
                break;
            default:
                throw new Error(`No application found for event type ${event.eventName}.`);
        }
    }
}

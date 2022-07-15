import { IEvent, OrderPlaced, LineItemAddedToOrder } from "./events";
import { v4 as uuid } from "uuid";

abstract class Aggregate {
    protected _aggregateId: string;
    private _pendingEvents: IEvent[] = [];

    public getAggregateId = () => this._aggregateId;

    protected raiseEvent(event: IEvent): void {
        this._pendingEvents.push(event);
        this.apply(event);
    }

    protected abstract apply(event: IEvent): void;

    public getPendingEvents(): IEvent[] {
        return this._pendingEvents;
    }

    public markPendingEventsAsCommitted(): void {
        this._pendingEvents = [];
    }

    public loadFromHistory(events: IEvent[]): void {
        for (const event of events) {
            this.apply(event);
        }
    }
}

export class Order extends Aggregate {
    public static place(lineItems: OrderLineItem[]): Order {
        const order = new Order();
        order.placeOrder(lineItems);
        return order;
    }

    private placeOrder(lineItems: OrderLineItem[]): void {
        this.raiseEvent(new OrderPlaced(uuid(), lineItems));
    }

    private applyOrderPlaced(event: OrderPlaced): void {
        this._aggregateId = event.aggregateId;
    }

    public addLineItem(lineItem: OrderLineItem): void {
        this.raiseEvent(new LineItemAddedToOrder(this._aggregateId, lineItem));
    }

    private applyLineItemAddedToOrder(event: LineItemAddedToOrder): void {}

    protected apply(event: IEvent): void {
        switch (event.type) {
            case "OrderPlaced":
                this.applyOrderPlaced(event as OrderPlaced);
                break;
            case "LineItemAddedToOrder":
                this.applyLineItemAddedToOrder(event as LineItemAddedToOrder);
                break;
            default:
                throw new Error(`No application found for event type ${event.type}.`);
        }
    }
}

export class OrderLineItem {
    sku: string;
    quantity: number;
    unitPrice: number;

    constructor(sku: string, quantity: number, unitPrice: number) {
        this.sku = sku;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}

export enum OrderStatus {
    Placed = "Placed",
}

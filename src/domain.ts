import { IEvent, OrderPlaced, LineItemAddedToOrder, OrderApproved } from "./events";
import { v4 as uuid } from "uuid";

abstract class Aggregate {
    protected aggregateId: string;
    private pendingEvents: IEvent[] = [];

    public getAggregateId = () => this.aggregateId;

    protected raiseEvent(event: IEvent): void {
        this.pendingEvents.push(event);
        this.apply(event);
    }

    protected abstract apply(event: IEvent): void;

    public getPendingEvents(): IEvent[] {
        return this.pendingEvents;
    }

    public markPendingEventsAsCommitted(): void {
        this.pendingEvents = [];
    }

    public loadFromHistory(events: IEvent[]): void {
        for (const event of events) {
            this.apply(event);
        }
    }
}

export class Order extends Aggregate {
    private orderStatus: OrderStatus;

    public static place(lineItems: OrderLineItem[]): Order {
        const order = new Order();
        order.placeOrder(lineItems);
        return order;
    }

    private placeOrder(lineItems: OrderLineItem[]): void {
        this.raiseEvent(new OrderPlaced(uuid(), lineItems));
    }

    private applyOrderPlaced(event: OrderPlaced): void {
        this.aggregateId = event.aggregateId;
        this.orderStatus = OrderStatus.Placed;
    }

    public addLineItem(lineItem: OrderLineItem): void {
        this.raiseEvent(new LineItemAddedToOrder(this.aggregateId, lineItem));
    }

    private applyLineItemAddedToOrder(event: LineItemAddedToOrder): void {}

    public approve(): void {
        if (this.orderStatus !== OrderStatus.Placed) {
            throw new DomainError("InvalidOrderStatus", `Orders can only be approved when in status '${OrderStatus.Placed}'.`);
        }

        this.raiseEvent(new OrderApproved(this.aggregateId));
    }

    private applyOrderApproved(event: OrderApproved): void {
        this.orderStatus = OrderStatus.Approved;
    }

    protected apply(event: IEvent): void {
        switch (event.type) {
            case "OrderPlaced":
                this.applyOrderPlaced(event as OrderPlaced);
                break;
            case "LineItemAddedToOrder":
                this.applyLineItemAddedToOrder(event as LineItemAddedToOrder);
                break;
            case "OrderApproved":
                this.applyOrderApproved(event as OrderApproved);
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
    Approved = "Approved",
}

export class DomainError extends Error {
    constructor(name: DomainErrorName, message: string) {
        super(message);
        this.name = name;
    }
}

export type DomainErrorName = "InvalidOrderStatus";

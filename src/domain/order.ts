import { Aggregate } from "./aggregate";
import { v4 as uuid } from "uuid";
import { OrderPlacedEvent } from "../events/order-placed-event";
import { OrderLineItemAddedEvent } from "../events/order-line-item-added-event";
import { Event } from "../events/events";

export class Order extends Aggregate {
    private status: OrderStatus;
    private orderTotal: number;

    public static place(lineItems: OrderLineItem[]): Order {
        const order = new Order();
        order.placeOrder(lineItems);
        return order;
    }

    private placeOrder(lineItems: OrderLineItem[]): void {
        const orderTotal = lineItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
        this.raiseEvent(new OrderPlacedEvent(uuid(), lineItems, orderTotal));
    }

    private applyOrderPlaced(event: OrderPlacedEvent): void {
        this._aggregateId = event.aggregateId;
        this.orderTotal = event.orderTotal;
        this.status = OrderStatus.Placed;
    }

    public addLineItem(lineItem: OrderLineItem): void {
        const orderTotal = (this.orderTotal += lineItem.unitPrice * lineItem.quantity);
        this.raiseEvent(new OrderLineItemAddedEvent(this._aggregateId, lineItem, orderTotal));
    }

    private applyOrderLineItemAdded(event: OrderLineItemAddedEvent): void {
        this.orderTotal = event.orderTotal;
    }

    protected apply(event: Event): void {
        console.info("Event ", event);

        switch (event.type) {
            case "OrderPlaced":
                this.applyOrderPlaced(event as OrderPlacedEvent);
                break;
            case "OrderLineItemAdded":
                this.applyOrderLineItemAdded(event as OrderLineItemAddedEvent);
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

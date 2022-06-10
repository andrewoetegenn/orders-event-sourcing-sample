import { IEvent } from "../events";
import { Aggregate } from "./aggregate";
import { v4 as uuid } from "uuid";
import { OrderPlaced } from "../features/place-order";
import { OrderLineItemAdded } from "../features/add-line-item";

export class Order extends Aggregate {
    private status: OrderStatus;
    private orderTotal: number;

    constructor() {
        super();
    }

    public static place(lineItems: OrderLineItem[]) {
        const order = new Order();
        order.placeOrder(lineItems);
        return order;
    }

    private placeOrder(lineItems: OrderLineItem[]) {
        const orderTotal = lineItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
        this.raiseEvent(new OrderPlaced(uuid(), lineItems, orderTotal));
    }

    private applyOrderPlaced = (event: OrderPlaced) => {
        this._aggregateId = event.id;
        this.orderTotal = event.orderTotal;
        this.status = OrderStatus.Placed;
    };

    public addLineItem(lineItem: OrderLineItem) {
        const orderTotal = (this.orderTotal += lineItem.unitPrice * lineItem.quantity);
        this.raiseEvent(new OrderLineItemAdded(this._aggregateId, lineItem, orderTotal));
    }

    private applyOrderLineItemAdded(event: OrderLineItemAdded) {
        this.orderTotal = event.orderTotal;
    }

    protected apply(event: IEvent) {
        switch (event.constructor.name) {
            case "OrderPlaced":
                this.applyOrderPlaced(event as OrderPlaced);
                break;
            case "OrderLineItemAdded":
                this.applyOrderLineItemAdded(event as OrderLineItemAdded);
                break;
            default:
                throw new Error(`No application found for event type ${event.constructor.name}.`);
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

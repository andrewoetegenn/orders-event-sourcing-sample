import { IEvent } from "../events";
import { Aggregate } from "./aggregate";
import { v4 as uuid } from "uuid";
import { OrderPlaced } from "../features/place-order";

export class Order extends Aggregate {
    private status: OrderStatus;

    constructor(lineItems: OrderLineItem[]) {
        super();
        this.raiseEvent(new OrderPlaced(uuid(), lineItems));
    }

    private applyOrderPlaced = (event: OrderPlaced) => {
        this._aggregateId = event.id;
        this.status = OrderStatus.Placed;
    };

    protected apply(event: IEvent) {
        switch (event.constructor.name) {
            case "OrderPlaced":
                this.applyOrderPlaced(event as OrderPlaced);
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

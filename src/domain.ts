import { IEvent, OrderPlaced, LineItemAddedToOrder, OrderApproved, OrderPaymentReceived, OrderCompleted } from "./events";
import { InvalidOrderStatusError, InvalidPaymentError } from "./errors";
import { v4 as uuid } from "uuid";
import { round } from "./utils";

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
    private orderStatus: OrderStatus = OrderStatus.Placed;
    private orderTotal: number = 0;
    private payments: Payment[] = [];

    public static place(lineItems: OrderLineItem[]): Order {
        const order = new Order();
        order.placeOrder(lineItems);
        return order;
    }

    private placeOrder(lineItems: OrderLineItem[]): void {
        const orderTotal = round(lineItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0));
        this.raiseEvent(new OrderPlaced(uuid(), lineItems, orderTotal));
    }

    private applyOrderPlaced(event: OrderPlaced): void {
        this.aggregateId = event.aggregateId;
        this.orderTotal = event.orderTotal;
    }

    public addLineItem(lineItem: OrderLineItem): void {
        if (this.orderStatus !== OrderStatus.Placed) {
            throw new InvalidOrderStatusError();
        }

        const orderTotal = round((this.orderTotal += lineItem.unitPrice * lineItem.quantity));
        this.raiseEvent(new LineItemAddedToOrder(this.aggregateId, lineItem, orderTotal));
    }

    private applyLineItemAddedToOrder(event: LineItemAddedToOrder): void {
        this.orderTotal = event.orderTotal;
    }

    public approve(): void {
        if (this.orderStatus === OrderStatus.Approved) {
            return;
        }

        if (this.orderStatus !== OrderStatus.Placed) {
            throw new InvalidOrderStatusError();
        }

        this.raiseEvent(new OrderApproved(this.aggregateId));
    }

    private applyOrderApproved(event: OrderApproved): void {
        this.orderStatus = OrderStatus.Approved;
    }

    public receivePayment(paymentId: string, amount: number): void {
        if (this.orderStatus !== OrderStatus.Approved) {
            throw new InvalidOrderStatusError();
        }

        if (this.calculatePaymentsTotal() + amount > this.orderTotal) {
            throw new InvalidPaymentError();
        }

        this.raiseEvent(new OrderPaymentReceived(this.aggregateId, paymentId, amount));

        if (this.calculatePaymentsTotal() === this.orderTotal) {
            this.raiseEvent(new OrderCompleted(this.aggregateId));
        }
    }

    private applyOrderPaymentReceived(event: OrderPaymentReceived): void {
        this.payments.push(new Payment(event.paymentId, event.amount));
    }

    private applyOrderCompleted(event: OrderCompleted): void {
        this.orderStatus = OrderStatus.Completed;
    }

    private calculatePaymentsTotal(): number {
        if (this.payments.length === 0) {
            return 0;
        }

        return round(this.payments.reduce((total, payment) => total + payment.amount, 0));
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
            case "OrderPaymentReceived":
                this.applyOrderPaymentReceived(event as OrderPaymentReceived);
                break;
            case "OrderCompleted":
                this.applyOrderCompleted(event as OrderCompleted);
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
    Completed = "Completed",
}

export class Payment {
    paymentId: string;
    amount: number;

    constructor(paymentId: string, amount: number) {
        this.paymentId = paymentId;
        this.amount = amount;
    }
}

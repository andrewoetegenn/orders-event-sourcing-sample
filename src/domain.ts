import { IEvent, OrderPlaced } from "./events";

export abstract class Aggregate {
    protected _aggregateId: string;
    private _pendingEvents: IEvent[] = [];

    public getAggregateId = () => this._aggregateId;

    protected raiseEvent = (event: IEvent) => {
        this._pendingEvents.push(event);
        this.apply(event);
    };

    protected abstract apply(event: IEvent): void;

    public getPendingEvents = (): IEvent[] => {
        return this._pendingEvents;
    };

    public markPendingEventsAsCommitted = () => {
        this._pendingEvents = [];
    };

    public buildFromHistoricalEvents = (events: IEvent[]) => {
        for (const event of events) {
            this.apply(event);
        }
    };
}

export class Order extends Aggregate {
    constructor(orderId: string) {
        super();
        this.raiseEvent(new OrderPlaced(orderId));
    }

    private applyOrderPlaced = (event: OrderPlaced) => {
        this._aggregateId = event.orderId;
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

import { IEvent } from "../events";

export abstract class Aggregate {
    protected _aggregateId: string;
    private _pendingEvents: IEvent[] = [];

    constructor() {}

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

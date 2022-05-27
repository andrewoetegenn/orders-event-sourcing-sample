import { IEvent } from "./event";

export abstract class Aggregate {
    protected _aggregateId: string;
    private _pendingEvents: IEvent[] = [];

    public getAggregateId = () => this._aggregateId;

    protected raiseEvent = (event: IEvent) => {
        console.debug(`Event raised: ${event.eventName}`);
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

    public rebuildFromHistoricalEvents = (events: IEvent[]) => {
        events.forEach((event) => {
            this.apply(event);
        });
    };
}

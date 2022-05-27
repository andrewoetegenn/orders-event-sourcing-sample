import { IEvent } from "./event";

export abstract class Aggregate {
    private _events: IEvent[] = [];

    protected raiseEvent = (event: IEvent) => {
        this._events.push(event);
        this.apply(event);
    };

    protected abstract apply(event: IEvent): void;
}

import { IEvent } from "../event";

export interface IOrderEvent extends IEvent {
    readonly orderId: string;
}

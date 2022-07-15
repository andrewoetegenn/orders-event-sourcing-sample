import { calculateOrderTotal, Order, OrderLineItem } from "../projections";
import { OrderLineItem as DomainOrderLineItem } from "../domain";
import { ordersQueryStore } from "../persistance";
import { LineItemAddedToOrder } from "../events";
import { EventBridgeHandler } from "aws-lambda";
import { round } from "../utils";

export const lineItemAddedToOrderHandler: EventBridgeHandler<"LineItemAddedToOrder", LineItemAddedToOrder, void> = async (event) => {
    const order = await ordersQueryStore.get(event.detail.aggregateId);

    const lineItemIndex = order.lineItems.findIndex((item) => item.sku === event.detail.lineItem.sku);

    if (lineItemIndex !== -1) {
        updateLineItem(order, lineItemIndex, event.detail.lineItem.quantity);
    } else {
        addLineItem(order, event.detail.lineItem);
    }

    order.orderTotal = calculateOrderTotal(order.lineItems);

    await ordersQueryStore.save(order);
};

const updateLineItem = (order: Order, lineItemIndex: number, quantity: number): void => {
    order.lineItems[lineItemIndex].quantity += quantity;
};

const addLineItem = (order: Order, lineItem: DomainOrderLineItem): void => {
    order.lineItems.push({
        sku: lineItem.sku,
        quantity: lineItem.quantity,
        unitPrice: lineItem.unitPrice,
    } as OrderLineItem);
};

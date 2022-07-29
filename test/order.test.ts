import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import axios from "axios";

const baseUrl = "https://i3zzmmndgk.execute-api.eu-west-1.amazonaws.com/prod";
const eventBusName = "";
const eventBridge = new EventBridgeClient({});

describe("order journeys", () => {
    let orderId: string;

    it("should fulfil order", async () => {
        await placeOrder();
        await addLineItemToOrder();
        await approveOrder();
        await publishPaymentReceived();
        // Shipment dispatched
        // Shipment delivered
    });

    const placeOrder = async () => {
        const request = {
            lineItems: [
                {
                    sku: "AAA-00001",
                    quantity: 1,
                    unitPrice: 4.99,
                },
                {
                    sku: "AAA-00002",
                    quantity: 2,
                    unitPrice: 12.49,
                },
            ],
        };

        const response = await axios.post(`${baseUrl}/orders`, request);
        orderId = response.data.orderId;
    };

    const addLineItemToOrder = async () => {
        const request = {
            sku: "AAA-00003",
            quantity: 3,
            unitPrice: 1.29,
        };

        await axios.post(`${baseUrl}/orders/${orderId}/items`, request);
    };

    const approveOrder = async () => {
        await axios.post(`${baseUrl}/orders/${orderId}/approve`);
    };

    const publishPaymentReceived = async () => {
        await publishEvent("payments", "paymentReceived", {
            aggregateId: "12345",
            type: "PaymentReceived",
            orderId: orderId,
            amount: 33.84,
        });
    };

    const publishShipmentDispatched = async () => {};

    const publishShipmentDelivered = async () => {};

    const publishEvent = async (source, detailType, event) => {
        const params = {
            Entries: [
                {
                    Detail: JSON.stringify(event),
                    DetailType: detailType,
                    EventBusName: "orders-event-bus",
                    Source: source,
                },
            ],
        };
        await eventBridge.send(new PutEventsCommand(params));
    };
});

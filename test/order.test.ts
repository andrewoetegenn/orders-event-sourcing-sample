import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import axios, { AxiosError } from "axios";

const baseUrl = "https://i7fs7084ze.execute-api.eu-west-1.amazonaws.com/prod";
const eventBusName = "OrdersEventSourcingSampleStackOrdersEvents24AB1CCC";
const eventBridge = new EventBridgeClient({});

describe("order journeys", () => {
    let orderId: string;

    it("should fulfil order", async () => {
        await placeOrder();

        console.log("Order ID: ", orderId);

        await waitForOrderStatus("Placed");

        console.log("Place Order");

        await addLineItemToOrder();

        console.log("Add Line To Order");

        await approveOrder();
        await waitForOrderStatus("Approved");

        console.log("Order Approved");

        await publishPaymentReceived();
        await waitForOrderStatus("Paid");

        console.log("Order Paid");

        await publishShipmentDispatched();
        await waitForOrderStatus("Dispatched");

        console.log("Order Dispatched");

        await publishShipmentDelivered();
        await waitForOrderStatus("Completed");

        console.log("Order Completed");
    }, 30_000);

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
            type: "paymentReceived",
            orderId: orderId,
            amount: 33.84,
        });
    };

    const publishShipmentDispatched = async () => {
        await publishEvent("shipments", "shipmentDispatched", {
            aggregateId: "12345",
            type: "shipmentDispatched",
            orderId: orderId,
            carrier: "FedEx",
            carrierService: "FedEx Next Day",
        });
    };

    const publishShipmentDelivered = async () => {
        await publishEvent("shipments", "shipmentDelivered", {
            aggregateId: "12345",
            type: "shipmentDelivered",
            orderId: orderId,
        });
    };

    const publishEvent = async (source: string, detailType: string, event) => {
        const params = {
            Entries: [
                {
                    Detail: JSON.stringify(event),
                    DetailType: detailType,
                    EventBusName: eventBusName,
                    Source: source,
                },
            ],
        };
        await eventBridge.send(new PutEventsCommand(params));
    };

    const waitForOrderStatus = async (status: string) => {
        await wait(async () => {
            try {
                const response = await axios.get(`${baseUrl}/orders/${orderId}`);
                return response.data.orderStatus === status;
            } catch (error) {
                const axiosError = error as AxiosError;

                if (axiosError.response?.status === 404) {
                    return false;
                }

                throw error;
            }
        });
    };

    const wait = async (action: () => Promise<boolean>, retryCount = 10, sleepTimeInMilliseconds = 1000) => {
        let i = 0;

        for (i = 0; i < retryCount; i++) {
            if (await action()) {
                break;
            }

            await sleep(sleepTimeInMilliseconds);
        }

        if (i === retryCount) {
            throw new Error("Retries exhausted, condition not met.");
        }
    };

    const sleep = (sleepTimeInMilliseconds: number) => new Promise((resolve) => setTimeout(resolve, sleepTimeInMilliseconds));
});

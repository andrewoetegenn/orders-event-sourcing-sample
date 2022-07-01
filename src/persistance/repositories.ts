import { PutCommand, PutCommandInput, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Order } from "../domain/order";
import { IEvent } from "../events/event";
import { client as dynamodb } from "../services/dynamodb";

interface IRepository<T> {
    save(aggregate: T): Promise<void>;
    getById(aggregateId: string): Promise<T>;
}

class OrdersRepository implements IRepository<Order> {
    constructor(private tableName: string) {
        this.tableName = tableName;
    }

    public async save(aggregate: Order): Promise<void> {
        const historicalEvents = await this.getEventsForAggregate(aggregate.getAggregateId());
        const pendingEvents = aggregate.getPendingEvents();

        let currentVersion = historicalEvents ? historicalEvents.length - 1 : -1;

        for (const event of pendingEvents) {
            const params: PutCommandInput = {
                TableName: this.tableName,
                Item: {
                    id: aggregate.getAggregateId(),
                    version: currentVersion + 1,
                    type: event.type,
                    event: JSON.stringify(event),
                    timestamp: new Date().getTime(),
                },
            };

            await dynamodb.send(new PutCommand(params));

            currentVersion++;
        }

        aggregate.markPendingEventsAsCommitted();
    }

    public async getById(aggregateId: string): Promise<Order> {
        const historicalEvents = await this.getEventsForAggregate(aggregateId);
        const aggregate = new Order();
        aggregate.loadFromHistory(historicalEvents);
        return aggregate;
    }

    private async getEventsForAggregate(aggregateId: string) {
        const params: QueryCommandInput = {
            TableName: this.tableName,
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
                ":id": aggregateId,
            },
            ConsistentRead: true,
        };

        const data = await dynamodb.send(new QueryCommand(params));

        if (!data.Items || data.Items.length === 0) {
            return [];
        }

        const events = data.Items.map((item) => item.event) as IEvent[];

        console.info("Events: ", events);

        return events;
    }
}

export const ordersRepository = new OrdersRepository(process.env.EVENT_STORE_NAME ?? "");

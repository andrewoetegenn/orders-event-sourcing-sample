import { PutCommand, PutCommandInput, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { OrderDetail as OrderProjection } from "./projections";
import { OrderNotFoundError } from "./errors";
import { dynamoDBClient } from "./services";
import { IEvent } from "./events";
import { Order } from "./domain";

interface IRepository<T> {
    save(aggregate: T): Promise<void>;
    getById(aggregateId: string): Promise<T>;
}

class OrdersRepository implements IRepository<Order> {
    constructor(private tableName: string) {
        this.tableName = tableName;
    }

    public async save(aggregate: Order): Promise<void> {
        const pendingEvents = aggregate.getPendingEvents();

        if (pendingEvents.length === 0) {
            return;
        }

        const historicalEvents = await this.getEventsForAggregate(aggregate.getAggregateId());
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

            await dynamoDBClient.send(new PutCommand(params));

            currentVersion++;
        }

        aggregate.markPendingEventsAsCommitted();
    }

    public async getById(aggregateId: string): Promise<Order> {
        const historicalEvents = await this.getEventsForAggregate(aggregateId);

        if (historicalEvents.length === 0) {
            throw new OrderNotFoundError();
        }

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

        const data = await dynamoDBClient.send(new QueryCommand(params));

        if (!data.Items || data.Items.length === 0) {
            return [];
        }

        const events = data.Items.map((item) => JSON.parse(item.event)) as IEvent[];

        return events;
    }
}

export const ordersRepository = new OrdersRepository(process.env.EVENT_STORE_NAME ?? "");

interface IQueryStore<T> {
    get(id: string): Promise<T>;
    save(data: T): Promise<void>;
}

class OrdersQueryStore implements IQueryStore<OrderProjection> {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    public async get(id: string): Promise<OrderProjection> {
        const params: QueryCommandInput = {
            TableName: this.tableName,
            KeyConditionExpression: `orderId = :orderId`,
            ExpressionAttributeValues: {
                ":orderId": id,
            },
            ConsistentRead: true,
        };

        const data = await dynamoDBClient.send(new QueryCommand(params));

        if (!data.Items || data.Items.length === 0) {
            throw new OrderNotFoundError();
        }

        return data.Items[0] as OrderProjection;
    }

    public async save(data: OrderProjection): Promise<void> {
        const params: PutCommandInput = {
            TableName: this.tableName,
            Item: data,
        };

        await dynamoDBClient.send(new PutCommand(params));
    }
}

export const ordersQueryStore = new OrdersQueryStore(process.env.QUERY_STORE_NAME ?? "");

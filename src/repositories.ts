import { PutCommand, PutCommandInput, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Aggregate, Order } from "./domain";
import { IEvent } from "./events";
import { client as dynamodb } from "./services/dynamodb";

interface IRepository<T> {
    save(aggregate: T): Promise<void>;
    getById(aggregateId: string): Promise<T>;
}

class Repository<T extends Aggregate> implements IRepository<T> {
    private tableName: string;
    private Type: new () => T;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    public save = async (aggregate: T) => {
        const historicalEvents = await this.getEventsById(aggregate.getAggregateId());
        const pendingEvents = aggregate.getPendingEvents();

        let currentVersion = historicalEvents ? historicalEvents.length - 1 : -1;

        for (const event of pendingEvents) {
            const params: PutCommandInput = {
                TableName: this.tableName,
                Item: {
                    id: aggregate.getAggregateId(),
                    version: currentVersion + 1,
                    name: event.constructor.name,
                    event: JSON.stringify(event),
                    timestamp: new Date().getTime(),
                },
            };

            await dynamodb.send(new PutCommand(params));

            currentVersion++;
        }

        aggregate.markPendingEventsAsCommitted();
    };

    public getById = async (aggregateId: string) => {
        const historicalEvents = await this.getEventsById(aggregateId);
        const aggregate = new this.Type() as T;
        aggregate.buildFromHistoricalEvents(historicalEvents);
        return aggregate;
    };

    private getEventsById = async (aggregateId: string) => {
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

        return data.Items as IEvent[];
    };
}

export const ordersRepository = new Repository<Order>(process.env.EVENT_STORE_NAME ?? "");

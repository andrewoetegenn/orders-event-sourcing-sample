import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    PutCommandInput,
    QueryCommand,
    QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Aggregate } from "./aggregate";
import { IEvent } from "./event";

export interface IRepository<T> {
    save(aggregate: T): Promise<void>;
    getById(aggregateId: string): Promise<T>;
}

const dynamo = new DynamoDBClient({});
const client = DynamoDBDocumentClient.from(dynamo);

export class Repository<T extends Aggregate> implements IRepository<T> {
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
                    id: event.aggregateId,
                    version: currentVersion + 1,
                    timestamp: new Date().getTime(),
                    event: JSON.stringify(event),
                },
            };

            await client.send(new PutCommand(params));

            currentVersion++;
        }

        aggregate.markPendingEventsAsCommitted();
    };

    public getById = async (aggregateId: string) => {
        const historicalEvents = await this.getEventsById(aggregateId);
        const aggregate = new this.Type() as T;
        aggregate.rebuildFromHistoricalEvents(historicalEvents);
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

        const data = await client.send(new QueryCommand(params));

        if (data.Count === 0) {
            return [];
        }

        return data.Items as IEvent[];
    };
}

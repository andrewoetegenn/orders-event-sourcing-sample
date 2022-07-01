import { PutCommand, PutCommandInput, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Order } from "../projections/order";
import { client as dynamodb } from "../services/dynamodb";

interface IQueryStore<T> {
    get(id: string): Promise<T>;
    save(data: T): Promise<void>;
}

class QueryStore<T> implements IQueryStore<T> {
    private tableName: string;
    private Type: new () => T;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    public async get(id: string): Promise<T> {
        const params: QueryCommandInput = {
            TableName: this.tableName,
            KeyConditionExpression: `orderId = :orderId`, // TODO: How do I make this generic??
            ExpressionAttributeValues: {
                ":orderId": id,
            },
            ConsistentRead: true,
        };

        const data = await dynamodb.send(new QueryCommand(params));

        if (!data.Items || data.Items.length === 0) {
            return new this.Type() as T;
        }

        return data.Items[0] as T;
    }

    public async save(data: T): Promise<void> {
        const params: PutCommandInput = {
            TableName: this.tableName,
            Item: data,
        };

        await dynamodb.send(new PutCommand(params));
    }
}

export const ordersQueryStore = new QueryStore<Order>(process.env.QUERY_STORE_NAME ?? "");

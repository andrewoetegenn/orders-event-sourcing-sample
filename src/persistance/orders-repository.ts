import { Repository } from "../core/repository";
import { Order } from "../domain/order";

export const ordersRepository = new Repository<Order>(process.env.TABLE_NAME ?? "");

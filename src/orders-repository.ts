import { Repository } from "./core/repository";
import { Order } from "./order";

export const ordersRepository = new Repository<Order>("Orders");

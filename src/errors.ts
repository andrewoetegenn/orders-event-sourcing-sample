export class InvalidOrderStatusError extends Error {
    constructor() {
        super(`Order not in valid status for this operation.`);
        this.name = "InvalidOrderStatus";
        Object.setPrototypeOf(this, InvalidOrderStatusError.prototype);
    }
}

export class OrderNotFoundError extends Error {
    constructor() {
        super(`Order not found.`);
        this.name = "OrderNotFound";
        Object.setPrototypeOf(this, OrderNotFoundError.prototype);
    }
}

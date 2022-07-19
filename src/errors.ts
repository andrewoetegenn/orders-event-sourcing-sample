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

export class InvalidPaymentError extends Error {
    constructor() {
        super("Payment amount is greater than the order total.");
        this.name = "InvalidPayment";
        Object.setPrototypeOf(this, InvalidPaymentError.prototype);
    }
}

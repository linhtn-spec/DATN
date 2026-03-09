/** Options for order payment status select fields */
export const paymentStatusOptions = [
    { value: "unpaid", label: "Unpaid" },
    { value: "partial_payment", label: "Partial payment" },
    { value: "paid", label: "Paid" },
];

/** Options for order shipping status select fields */
export const shippingStatusOptions = [
    { value: "not_sent", label: "Not sent" },
    { value: "sending", label: "Sending" },
    { value: "sent", label: "Done" },
];

/** Options for order status select fields */
export const orderStatusOptions = [
    { value: "new", label: "New" },
    { value: "processing", label: "Processing" },
    { value: "hold", label: "Hold" },
    { value: "canceled", label: "Canceled" },
    { value: "done", label: "Done" },
];

/** Options for shipping method select fields */
export const shippingMethodOptions = [
    { value: "express", label: "Express" },
    { value: "free", label: "Free" },
    { value: "standard", label: "Standard" },
];

/** Options for payment method select fields */
export const paymentMethodOptions = [
    { value: "vnpay", label: "VNPAY" },
    { value: "cod", label: "COD" },
];

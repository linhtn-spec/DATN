/** Options for order payment status select fields */
export const paymentStatusOptions = [
    { value: "unpaid", label: "Chưa thanh toán" },
    { value: "paid", label: "Đã thanh toán" },
];

/** Options for order shipping status select fields */
export const shippingStatusOptions = [
    { value: "not_sent", label: "Chưa gửi" },
    { value: "sending", label: "Đang giao" },
    { value: "sent", label: "Đã giao" },
];

/** Options for order status select fields */
export const orderStatusOptions = [
    { value: "new", label: "Mới" },
    { value: "processing", label: "Đang xử lý" },
    { value: "hold", label: "Tạm giữ" },
    { value: "canceled", label: "Đã hủy" },
    { value: "done", label: "Hoàn thành" },
];

/** Options for shipping method select fields */
export const shippingMethodOptions = [
    { value: "express", label: "Hỏa tốc" },
    { value: "free", label: "Miễn phí" },
    { value: "standard", label: "Tiêu chuẩn" },
];

/** Options for payment method select fields */
export const paymentMethodOptions = [
    { value: "vnpay", label: "VNPAY" },
    { value: "cod", label: "COD" },
];

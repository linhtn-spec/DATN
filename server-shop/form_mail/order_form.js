export const order_form = (data) => {
    const { total, tax, products, paymentStatus, shippingCost, firstNameReceiver, lastNameReceiver } = data;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    let subTotal
    if (Array.isArray(products)) {
        subTotal = products.reduce((pre, cur) => pre + cur.subPrice, 0)
    }
    const productRows = products.map((item, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${item.productId.images}" width="50" height="50" style="object-fit: cover; border-radius: 4px;">
                    <span>${item.productId.name}</span>
                </div>
            </td>
            <td style="text-align: right;">${Number(item.productId.price).toLocaleString('vi-VN')}&nbsp;₫</td>
            <td style="text-align: center;">${item.quantity}</td>
        </tr>
    `).join('');
    return `
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,500;1,700;1,900&display=swap"
        rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html,
        body {
            width: 100%;
            height: 100%;
        }

        .main {
            width: 100%;
            height: 100%;
            background-color: #edf2f7;
            display: flex;
            align-items: center;
            justify-content: center;
        }



        .content {
            width: 100%;
            max-width: 600px;
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            margin:40px auto;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th, td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
        }
        
        thead {
            background-color: #2d3748;
            color: white;
        }

        h4 {
            color: #2d3748;
            margin-bottom: 10px;
        }

        p {
            margin: 0;
            line-height: 1.5;
        }

        .summary-block {
            margin-top: 20px;
            text-align: right;
        }

        button {
            padding: 12px 24px;
            border: none;
            background-color: #2d3748;
            border-radius: 6px;
            color: white;
            font-size: 16px;
            cursor: pointer;
        }

        .button-wrap {
            text-align: center;
            margin-top: 40px;
        }
        
        a {
            text-decoration: none;
        }
    </style>
</head>

<body>
    <div class="main">
        <div class="content">
            <h4>Xin chào ${firstNameReceiver || ''} ${lastNameReceiver || ''}!</h4>
            <p>Cảm ơn bạn đã tin tưởng và đặt hàng. Dưới đây là thông tin chi tiết đơn hàng của bạn:</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 10%; text-align: center;">STT</th>
                        <th style="width: 50%;">Tên sản phẩm</th>
                        <th style="width: 25%; text-align: right;">Giá</th>
                        <th style="width: 15%; text-align: center;">SL</th>
                    </tr>
                </thead>
                <tbody>
                  ${productRows}
                </tbody>
            </table>
            
            <div class="summary-block">
                <p><strong>Tạm tính:</strong> ${Number(subTotal ? subTotal : (total - tax - (shippingCost || 0))).toLocaleString('vi-VN')}&nbsp;₫</p>
                <p><strong>Phí vận chuyển:</strong> ${shippingCost ? Number(shippingCost).toLocaleString('vi-VN') : 0}&nbsp;₫</p>
                <p><strong>Thuế:</strong> ${Number(tax).toLocaleString('vi-VN')}&nbsp;₫</p>
                <p style="margin-top: 10px; font-size: 1.1em;"><strong>Tổng cộng: <span style="color: #e53e3e;">${Number(total).toLocaleString('vi-VN')}</span>&nbsp;₫</strong></p>
            </div>
            
            <p style="margin: 20px 0; padding: 10px; background-color: #f7fafc; border-left: 4px solid #3182ce;">
                <strong>Trạng thái thanh toán:</strong> ${paymentStatus === 'paid' ? 'Đã thanh toán' : (paymentStatus === 'refunded' ? 'Đã hoàn tiền' : 'Chưa thanh toán (COD)')}
            </p>
            
            <p>Hẹn gặp lại bạn trong những lần mua sắm tiếp theo!</p>
            <p style="margin-top: 10px;">Trân trọng,</p>
            <h4>Fruit Shop</h4>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <div class="button-wrap">
                <a href="${frontendUrl}/client/shop">
                    <button>Tiếp tục mua sắm</button>
                </a>
            </div>
        </div>
    </div>
</body>

</html>`}

export const order_subject = `Xác nhận đơn hàng từ Fruit Shop.`


export const order_text = `Dưới đây là thông tin đơn hàng của bạn. Cảm ơn bạn đã mua hàng.`
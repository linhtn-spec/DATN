export const order_form = (data) => {
    const { total, tax, products, paymentStatus } = data;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    let subTotal
    if (Array.isArray(products)) {
        subTotal = products.reduce((pre, cur) => pre + cur.subPrice, 0)
    }
    const productRows = products.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                ${item.productId.name}
                <img src="${item.productId.images}" width="50px" height="50px">
            </td>
            <td>${item.productId.price}$</td>
            <td>${item.quantity}</td>
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
            width: 50%;
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            margin:100px auto;
        }

        table,
        tr,
        th,
        td,
        thead,
        tbody {
            border: 0.01px solid black;
            text-wrap: wrap;
            border-collapse: collapse;
        }

        h4 {
            color: #2d3748;
        }

        th {
            padding: 5px;
        }

        td {
            padding: 5px 10px;
        }

        table {
            width: 100%;
        }

        p {
            margin: 0;
        }

        button {
            padding: 10px;
            border: 0.01px solid #2d3748;
            background-color: #2d3748;
            border-radius: 6px;
            color: white;
        }

        .button_wrap {
            margin: 50px 130px;
        }
        thead {
            background-color: #2d3748;
            color: white;
        }

        th {
            font-weight: 400;

        }

        .button_wrap {
            width:100%;
            margin: 50px auto;
           cursor: pointer;
           text-align: center;

        }

        table {
            margin: 20px 0;
        }
    </style>
</head>

<body>
    <div class="main">
        <div class="content">
            <h4>Hello!</h4>
            <p>You have placed an order. This is your order below</p>
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>QTY</th>
                    </tr>
                </thead>
                <tbody>
                  ${productRows}
                </tbody>
            </table>
            <p><strong>Subtotal:</strong> ${subTotal ? subTotal : (total - tax)}$</p>
            <p><strong>Tax:</strong> ${tax}$</p>
            <p style="margin-bottom:20px ;"><strong>Total:</strong> ${total}$</p>
            <p style="margin-bottom:20px ;"><strong>Payment status: ${paymentStatus}</strong></p>
            <p>Thanks for purchasing our products. Wish to see you in near future.</p>
            <p>Regards,</p>
            <h4>Scart</h4>
            <hr>
            <div class="button_wrap" style="cursor:pointer">
                <a href="${frontendUrl}/client" class="button">
                    <button>
                        Click here to continue purchasing
                    </button>
                </a>
            </div>
        </div>
    </div>
</body>

</html>`}

export const order_subject = `Order from Scart.`


export const order_text = `Below is your order. Thanks for purchasing our products.`
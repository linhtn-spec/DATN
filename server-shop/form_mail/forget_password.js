export const forget_password_form = (token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const changePasswordPath = process.env.FRONTEND_CHANGE_PASSWORD_PATH || '/change-password';
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
            height: 1200px;
        }

        .main {
            width: 100%;
            height: 600px;
            background-color: #edf2f7;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        button {
            padding: 20px;
            background-color: #2d3748;
            font-weight: 400;
            border-radius: 8px;
            margin:10px auto;

        }

        button  {
            color: white;
            font-weight:500;
        }

        p {
            margin: 0;
        }

        a {
            text-decoration: none;
        }

        .content {
            width: 50%;
            height: 80%;
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            margin: 60px auto;
        }

        .button_wrap {
            text-align:center;
            width:100%;
        }
    </style>
</head>

<body>
    <div class="main" style="display: flex;
            align-items: center;
            justify-content: center;">
        <div class="content">
            <h4>Hello!</h4>
            <p>You have requested to reset password of your account. Click the button below.</p>
            <div class="button_wrap">
                    <a style="color: white;" href="${frontendUrl}${changePasswordPath}/${token}" class="button">
                <button>
                        Reset password
                </button>
                    </a>
            </div>
            <p>Regards,</p>
            <h4>Scart</h4>
            <hr>
            <p>If you're having trouble clicking the "Reset password" button, copy and paste the URL below into your web
                browser:<a href="${frontendUrl}${changePasswordPath}/${token}">
                    ${frontendUrl}${changePasswordPath}/${token}</a>
            </p>
        </div>
    </div>
</body>

</html>`
}

export const forget_password_subject = `Reset Password Request`


export const forget_password_text = `This is your reset password email. This request is available for 10 mins.`
export const verify_email_subject = "Xác nhận địa chỉ email của bạn";

export const verify_email_text = (token) => `Chào mừng bạn! Vui lòng xác nhận email của bạn bằng cách nhấp vào liên kết sau: ${process.env.FRONTEND_URL}/verify-email/${token}`;

export const verify_email_form = (token) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Xác nhận Email</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Cảm ơn bạn đã đăng ký tài khoản! Để hoàn tất quá trình đăng ký, vui lòng nhấn vào nút bên dưới để xác nhận địa chỉ email của bạn.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/verify-email/${token}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
               Xác nhận Email
            </a>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} Fruity Shop. All rights reserved.
        </p>
    </div>
    `;
};

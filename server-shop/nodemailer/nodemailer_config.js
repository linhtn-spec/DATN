import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});
const sendEmail = async (from, to, subject, text, html) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail({
            from: from,
            to: to,
            subject: subject,
            text: text,
            html: html
        }, (err, info) => {
            if (err) {
                console.error("Mail error: ", err);
                reject(err);
            } else {
                transporter.close();
                resolve(info);
            }
        });
    });
}
export { sendEmail }
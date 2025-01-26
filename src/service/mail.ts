import nodemailer from "nodemailer";
import config from "../config";
import logger from "../../logger";

const transporter = nodemailer.createTransport({
    host: config.MAIL_HOST,
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: config.MAIL_USER,
        pass: config.MAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, body: string) => {
    try {
        await transporter.sendMail({
            from: `${config.MAIL_FROM_NAME} <${config.MAIL_FROM}>`,
            to,
            subject,
            html: body,
        });

        logger.info("Email sent successfully");
    } catch (error) {
        logger.error("Error sending email", error);
    }
};

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: `"Auth OTP" <${process.env.EMAIL_SENDER}>`, // 👈 updated
      to: email,
      subject: "Your OTP Code | Auth OTP", // 👈 updated
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
          <h2>Your One-Time Password</h2>
          <p>Use the code below to verify your email. It expires in <strong>10 minutes</strong>.</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; 
                      padding: 16px; background: #f4f4f4; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 16px;">
            If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });
    console.log("📨 Email sent:", info.messageId);
  } catch (error: any) {
    console.error("EMAIL ERROR:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.resendApiKey);

export class EmailService {
  async sendVerificationEmail(
    email: string,
    verificationCode: string,
  ): Promise<void> {
    const { error } = await resend.emails.send({
      from: env.emailFrom,
      to: [email],
      subject: "Verify your Job Tracker account",
      text: [
        "Welcome to Job Tracker!",
        "",
        `Your verification code is: ${verificationCode}`,
        "",
        "This code expires in 10 minutes.",
        "If you did not create this account, you can ignore this email.",
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
          <h2 style="margin-bottom: 8px;">Verify your email</h2>
          <p>Welcome to Job Tracker! Enter this code to verify your email address.</p>
          <div style="margin: 24px 0; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">
              ${verificationCode}
            </span>
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p style="font-size: 13px; color: #6b7280;">
            If you did not create this account, you can ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send verification email:", error.message);
      throw new Error("Unable to send verification email. Please try again.");
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetCode: string,
  ): Promise<void> {
    const { error } = await resend.emails.send({
      from: env.emailFrom,
      to: [email],
      subject: "Reset your Job Tracker password",
      text: [
        "You requested to reset your Job Tracker password.",
        "",
        `Your password reset code is: ${resetCode}`,
        "",
        "This code expires in 10 minutes.",
        "If you did not request this, you can ignore this email.",
      ].join("\n"),
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
        <h2>Reset your password</h2>
        <p>Enter this code to reset your Job Tracker password.</p>
        <div style="margin: 24px 0; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${resetCode}
          </span>
        </div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="font-size: 13px; color: #6b7280;">
          If you did not request this, you can ignore this email.
        </p>
      </div>
    `,
    });

    if (error) {
      console.error("Failed to send password reset email:", error.message);
      throw new Error("Unable to send password reset email. Please try again.");
    }
  }
}

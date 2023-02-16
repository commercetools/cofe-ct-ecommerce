import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Context, Project } from '@frontastic/extension-types';
import { SmtpConfig } from '../interfaces/SmtpConfig';
import { SmtpConfigurationError } from '../errors/SmtpConfigurationError';
import { BaseEmailApi } from '../interfaces/BaseEmailApi';

export class EmailApi implements BaseEmailApi {
  // Email transporter
  transport: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  locale: string;

  sender: string;

  client_host: string;

  constructor(frontasticContext: Context, locale: string) {
    const smtpConfig = this.getSmtpConfig(frontasticContext.project);

    this.client_host = smtpConfig.client_host;
    this.sender = smtpConfig.sender;

    this.locale = locale;

    this.transport = nodemailer.createTransport({
      host: smtpConfig.host,
      port: +smtpConfig.port,
      secure: smtpConfig.port == 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    });
  }

  protected getSmtpConfig(project: Project): SmtpConfig {
    if (!project.configuration.hasOwnProperty('smtp')) {
      throw new SmtpConfigurationError({
        message: `The SMTP configuration is missing in project "${project.projectId}"`,
      });
    }

    const smtpConfig: SmtpConfig = {
      host: project.configuration.smtp.host,
      port: project.configuration.smtp.port,
      encryption: project.configuration.smtp.encryption,
      user: project.configuration.smtp.user,
      password: project.configuration.smtp.password,
      sender: project.configuration.smtp.sender,
      client_host: project.configuration.smtp.client_host,
    };

    return smtpConfig;
  }

  async sendEmail(data: { to: string; subject?: string; text?: string; html?: string }) {
    const from = this.sender;
    const { to, text, html, subject } = data;
    return await this.transport.sendMail({ from, to, subject, text, html });
  }

  async sendAccountVerificationEmail(customer: Account) {
    if (!customer.confirmationToken?.token) {
      console.error('No valid confirmation token');
      return;
    }

    const verificationUrl = `${this.client_host}/verify?token=${customer.confirmationToken.token}`;

    const htmlVerificationMessage = `
      <h1>Thanks for your registration!</h1>
      <p style="margin-top: 10px;color:gray;">Please activate your account by clicking the below link</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `;

    await this.sendEmail({
      to: customer.email,
      subject: 'Account Verification',
      html: htmlVerificationMessage,
    });
  }

  async sendPasswordResetEmail(customer: Account, token: string) {
    if (!token) {
      console.error('No valid reset token');
      return;
    }

    const url = `${this.client_host}/reset-password?token=${token}`;

    const htmlResetPasswordMessage = `
      <h1>You requested a password reset!</h1>
      <p style="margin-top: 10px;color:gray;">Please click the link below to proceed.</p>
      <a href="${url}">${url}</a>
    `;

    await this.sendEmail({
      to: customer.email,
      subject: 'Password Reset',
      html: htmlResetPasswordMessage,
    });
  }

  async sendOrderConfirmationEmail(order: Order) {
    const htmlPaymentConfirmationMessage = `
      <h1>Thanks for your order!</h1>
      <p style="margin-top: 10px;color:gray;">Your payment has been confirmed.</p>
    `;

    await this.sendEmail({
      to: order.email,
      subject: 'Order confirmed',
      html: htmlPaymentConfirmationMessage,
    });
  }

  async sendWelcomeCustomerEmail(customer: Account) {
    const htmlWelcomeCustomerMessage = `
      <h1>Hello ${customer.firstName} ${customer.lastName}</h1>
      <p>We are so happy to have you here!</p>
    `;
    await this.sendEmail({
      to: customer.email,
      subject: 'Welcome',
      html: htmlWelcomeCustomerMessage,
    });
  }

  async sendAccountDeletionEmail(customer: Account) {
    const htmlWelcomeCustomerMessage = `
      <h1>Hello ${customer.firstName} ${customer.lastName}</h1>
      <p>Your account has been deleted successfully!</p>
    `;
    await this.sendEmail({
      to: customer.email,
      subject: 'Account deleted',
      html: htmlWelcomeCustomerMessage,
    });
  }
}

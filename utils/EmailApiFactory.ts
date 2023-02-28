import { Account } from '@commercetools/frontend-domain-types/account/Account';
import { Order } from '@commercetools/platform-sdk';
import { Context } from '@frontastic/extension-types';

export interface BaseEmailApi {
  sendEmail?: (data: { to: string; subject?: string; text?: string; html?: string }) => Promise<void>;
  sendAccountVerificationEmail: (customer: Account) => Promise<void>;
  sendPasswordResetEmail: (customer: Account, token: string) => Promise<void>;
  sendOrderConfirmationEmail: (order: Order) => Promise<void>;
  sendWelcomeCustomerEmail: (customer: Account) => Promise<void>;
  sendAccountDeletionEmail: (customer: Account) => Promise<void>;
  subscribe?: (customer: Account, topic: string[]) => Promise<void>;
  unsubscribe?: (customer: Account) => Promise<void>;
}

export class EmailApiFactory {
  SmtpApi: new (context: Context, locale: string) => BaseEmailApi;
  SendgridApi: new (context: Context, locale: string) => BaseEmailApi;
  constructor(SmtpApi, SendgridApi) {
    this.SmtpApi = SmtpApi;
    this.SendgridApi = SendgridApi;
  }
  getSmtpApi(context: Context, locale: string) {
    return new this.SmtpApi(context, locale);
  }

  getSendgridApi(context: Context, locale: string) {
    return new this.SendgridApi(context, locale);
  }

  getDefaultApi(context: Context, locale: string) {
    return this.getSmtpApi(context, locale);
  }
}

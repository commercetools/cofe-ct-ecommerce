import { EmailApiFactory } from '../utils/EmailApiFactory';
import { EmailApi as SendgridEmailApi } from '../utils/email-sendgrid/apis/EmailApi';
import { EmailApi as SmtpEmailApi } from '../utils/email-smtp/apis/EmailApi';

export const EmailApi = new EmailApiFactory(SmtpEmailApi, SendgridEmailApi);

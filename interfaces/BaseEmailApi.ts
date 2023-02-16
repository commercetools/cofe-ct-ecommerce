import { Account } from "@commercetools/frontend-domain-types/account/Account";
import { Order } from "@commercetools/frontend-domain-types/cart/Order";

export interface BaseEmailApi {
  sendWelcomeCustomerEmail: (customer: Account) => Promise<void>;
  sendAccountVerificationEmail: (customer: Account) => Promise<void>;
  sendPasswordResetEmail: (customer: Account, token: string) => Promise<void>;
  sendAccountDeletionEmail: (customer: Account) => Promise<void>;
  sendOrderConfirmationEmail: (order: Order) => Promise<void>;
}

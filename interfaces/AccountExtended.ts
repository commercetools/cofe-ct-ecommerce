import { Account } from '@commercetools/frontend-domain-types/account/Account';

export type AccountExtended = Account & {
  isSubscribed?: boolean;
  email?: string;
  company?: string;
}
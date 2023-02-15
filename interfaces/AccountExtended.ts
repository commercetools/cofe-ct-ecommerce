import { Account } from '@commercetools/frontend-domain-types/account/Account';

export type AccountExtended = Account & {
  isSubscribed?: boolean;
}
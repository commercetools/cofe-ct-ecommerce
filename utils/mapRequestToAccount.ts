import { AccountExtended as Account } from '../interfaces/AccountExtended';
import { parseBirthday } from './parseBirthday';
import { AccountRegisterBody } from '../actionControllers/AccountController';

export function mapRequestToAccount(accountRegisterBody: AccountRegisterBody): Account {
  const account: Account = {
    email: accountRegisterBody?.email ?? '',
    password: accountRegisterBody?.password,
    salutation: accountRegisterBody?.salutation,
    firstName: accountRegisterBody?.firstName,
    lastName: accountRegisterBody?.lastName,
    birthday: parseBirthday(accountRegisterBody),
    isSubscribed: accountRegisterBody?.isSubscribed,
    addresses: [],
  };

  if (accountRegisterBody.billingAddress) {
    accountRegisterBody.billingAddress.isDefaultBillingAddress = true;
    accountRegisterBody.billingAddress.isDefaultShippingAddress = !(accountRegisterBody.shippingAddress !== undefined);

    account.addresses!.push(accountRegisterBody.billingAddress);
  }

  if (accountRegisterBody.shippingAddress) {
    accountRegisterBody.shippingAddress.isDefaultShippingAddress = true;
    accountRegisterBody.shippingAddress.isDefaultBillingAddress = !(accountRegisterBody.billingAddress !== undefined);

    account.addresses!.push(accountRegisterBody.shippingAddress);
  }

  return account;
}

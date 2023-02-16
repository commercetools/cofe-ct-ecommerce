import { Context, Request, Response } from '@frontastic/extension-types';
import { ActionContext } from '@frontastic/extension-types';
import { AccountExtended as Account } from '../interfaces/AccountExtended';
import { Address } from '@commercetools/frontend-domain-types/account/Address';
import { CartFetcher } from '../utils/CartFetcher';
import { getLocale } from '../utils/Request';
import { AccountAuthenticationError } from '../errors/AccountAuthenticationError';
import { assertIsAuthenticated } from '../utils/assertIsAuthenticated';
import { mapRequestToAccount } from '../utils/mapRequestToAccount';
import { fetchAccountFromSession } from '../utils/fetchAccountFromSession';
import type { AccountApi as AccountApiType } from '../apis/AccountApi';
import type { EmailApi as EmailApiType } from '../apis/EmailApi';

type ActionHook = (request: Request, actionContext: ActionContext) => Promise<Response>;

export type AccountRegisterBody = {
  email?: string;
  password?: string;
  salutation?: string;
  firstName?: string;
  lastName?: string;
  birthdayYear?: string;
  birthdayMonth?: string;
  birthdayDay?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  isSubscribed?: boolean;
};

type AccountLoginBody = {
  email?: string;
  password?: string;
};

type AccountChangePasswordBody = {
  oldPassword: string;
  newPassword: string;
};

export const AccountController = ({
  AccountApi,
  EmailApi,
}: {
  AccountApi: new (context: Context, locale: string) => AccountApiType;
  EmailApi?: new (context: Context, locale: string) => EmailApiType;
}) => {
  async function loginAccount(request: Request, actionContext: ActionContext, account: Account): Promise<Response> {
    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    const cart = await CartFetcher.fetchCart(request, actionContext);

    try {
      account = await accountApi.login(account, cart);
    } catch (error) {
      if (error instanceof AccountAuthenticationError) {
        const response: Response = {
          statusCode: 401,
          body: JSON.stringify(error.message),
          sessionData: {
            ...request.sessionData,
            account: account,
          },
        };

        return response;
      }

      throw error;
    }

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account: account,
      },
    };

    return response;
  }

  const getAccount: ActionHook = async (request: Request) => {
    const account = fetchAccountFromSession(request);

    if (account === undefined) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          loggedIn: false,
        }),
      };
    }

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify({
        loggedIn: true,
        account,
      }),
      sessionData: {
        ...request.sessionData,
        account: account,
      },
    };

    return response;
  };

  const register: ActionHook = async (request: Request, actionContext: ActionContext) => {
    const locale = getLocale(request);

    const accountApi = new AccountApi(actionContext.frontasticContext, locale);
    const accountData = mapRequestToAccount(JSON.parse(request.body).account);

    const cart = await CartFetcher.fetchCart(request, actionContext);

    const account = await accountApi.create(accountData, cart);

    if (EmailApi) {
      const emailApi = new EmailApi(actionContext.frontasticContext, locale);

      emailApi.sendWelcomeCustomerEmail(account);

      emailApi.sendAccountVerificationEmail(account);
    }

    const response: Response = {
      statusCode: 200,
      //body: JSON.stringify(account),
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
      },
    };

    return response;
  };

  const requestConfirmationEmail: ActionHook = async (request: Request, actionContext: ActionContext) => {
    const locale = getLocale(request);

    const accountApi = new AccountApi(actionContext.frontasticContext, locale);

    const accountLoginBody: AccountLoginBody = JSON.parse(request.body);

    let account = {
      email: accountLoginBody.email,
      password: accountLoginBody.password,
    } as Account;

    const cart = await CartFetcher.fetchCart(request, actionContext);

    account = await accountApi.login(account, cart);

    if (account.confirmed) {
      const response: Response = {
        statusCode: 405,
        body: JSON.stringify(`Your email address "${account.email}" was verified already.`),
        sessionData: {
          ...request.sessionData,
          account: account,
        },
      };

      return response;
    }

    if (EmailApi) {
      const emailApi = new EmailApi(actionContext.frontasticContext, locale);
      emailApi.sendAccountVerificationEmail(account);
    }
    const response: Response = {
      statusCode: 200,
      body: JSON.stringify({}),
      sessionData: {
        ...request.sessionData,
      },
    };

    return response;
  };

  const confirm: ActionHook = async (request: Request, actionContext: ActionContext) => {
    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    type AccountConfirmBody = {
      token?: string;
    };

    const accountConfirmBody: AccountConfirmBody = JSON.parse(request.body);

    const account = await accountApi.confirmEmail(accountConfirmBody.token);

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account: account,
      },
    };

    return response;
  };

  const login: ActionHook = async (request: Request, actionContext: ActionContext) => {
    const accountLoginBody: AccountLoginBody = JSON.parse(request.body);

    const account = {
      email: accountLoginBody.email,
      password: accountLoginBody.password,
    } as Account;

    return await loginAccount(request, actionContext, account);
  };

  const logout: ActionHook = async (request: Request) => {
    return {
      statusCode: 200,
      body: JSON.stringify({}),
      sessionData: {
        ...request.sessionData,
        account: undefined,
      },
    } as Response;
  };

  /**
   * Change password
   */
  const password: ActionHook = async (request: Request, actionContext: ActionContext) => {
    assertIsAuthenticated(request);

    let account = fetchAccountFromSession(request);

    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    const accountChangePasswordBody: AccountChangePasswordBody = JSON.parse(request.body);

    account = await accountApi.updatePassword(
      account,
      accountChangePasswordBody.oldPassword,
      accountChangePasswordBody.newPassword,
    );

    return {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account,
      },
    } as Response;
  };

  /**
   * Request new reset token
   */
  const requestReset: ActionHook = async (request: Request, actionContext: ActionContext) => {
    const locale = getLocale(request);

    type AccountRequestResetBody = {
      email?: string;
    };

    const accountApi = new AccountApi(actionContext.frontasticContext, locale);

    const accountRequestResetBody: AccountRequestResetBody = JSON.parse(request.body);

    const passwordResetToken = await accountApi.generatePasswordResetToken(accountRequestResetBody.email);

    if (EmailApi) {
      const emailApi = new EmailApi(actionContext.frontasticContext, locale);
      emailApi.sendPasswordResetEmail(accountRequestResetBody as Account, passwordResetToken.token);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({}),
      sessionData: {
        ...request.sessionData,
        // TODO: should we redirect to logout rather to unset the account?
        account: undefined,
      },
    } as Response;
  };

  /**
   * Reset password
   */
  const reset: ActionHook = async (request: Request, actionContext: ActionContext) => {
    type AccountResetBody = {
      token?: string;
      newPassword?: string;
    };

    const accountResetBody: AccountResetBody = JSON.parse(request.body);

    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    const account = await accountApi.resetPassword(accountResetBody.token, accountResetBody.newPassword);
    account.password = accountResetBody.newPassword;

    return await loginAccount(request, actionContext, account);
  };

  const update: ActionHook = async (request: Request, actionContext: ActionContext) => {
    assertIsAuthenticated(request);

    let account = fetchAccountFromSession(request);

    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    account = {
      ...account,
      ...mapRequestToAccount(JSON.parse(request.body)),
    };

    account = await accountApi.update(account);

    return {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account,
      },
    } as Response;
  };

  const addIsSubscribedType: ActionHook = async (request: Request, actionContext: ActionContext) => {
    assertIsAuthenticated(request);

    let account = fetchAccountFromSession(request);
    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    account = await accountApi.addIsSubscribedType(account);

    return {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account,
      },
    } as Response;
  };

  const updateSubscription: ActionHook = async (request: Request, actionContext: ActionContext) => {
    assertIsAuthenticated(request);

    let account = fetchAccountFromSession(request);

    const isSubscribed: Account['isSubscribed'] = JSON.parse(request.body).isSubscribed;

    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    account = await accountApi.updateSubscription(account, isSubscribed);

    // if (EmailApi) {
    //   const emailApi = new EmailApi(actionContext.frontasticContext, getLocale(request));
    //   await (isSubscribed ? emailApi.subscribe(account, ['newsletter']) : emailApi.unsubscribe(account));
    // }
    
    return {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account,
      },
    } as Response;
  };

  const addAddress: ActionHook = async (request: Request, actionContext: ActionContext) => {
    assertIsAuthenticated(request);

    let account = fetchAccountFromSession(request);

    const address: Address = JSON.parse(request.body).address;

    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    account = await accountApi.addAddress(account, address);

    return {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account,
      },
    } as Response;
  };

  const addShippingAddress: ActionHook = async (request: Request, actionContext: ActionContext) => {
    assertIsAuthenticated(request);

    let account = fetchAccountFromSession(request);

    const address: Address = JSON.parse(request.body).address;

    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    account = await accountApi.addShippingAddress(account, address);

    return {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account,
      },
    } as Response;
  };

  const addBillingAddress: ActionHook = async (request: Request, actionContext: ActionContext) => {
    assertIsAuthenticated(request);

    let account = fetchAccountFromSession(request);

    const address: Address = JSON.parse(request.body).address;

    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    account = await accountApi.addBillingAddress(account, address);

    return {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account,
      },
    } as Response;
  };

  const updateAddress: ActionHook = async (request: Request, actionContext: ActionContext) => {
    assertIsAuthenticated(request);

    let account = fetchAccountFromSession(request);

    const address: Address = JSON.parse(request.body).address;

    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    account = await accountApi.updateAddress(account, address);

    return {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account,
      },
    } as Response;
  };

  const removeAddress: ActionHook = async (request: Request, actionContext: ActionContext) => {
    assertIsAuthenticated(request);

    let account = fetchAccountFromSession(request);

    const address: Address = JSON.parse(request.body);

    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    account = await accountApi.removeAddress(account, address);

    return {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account,
      },
    } as Response;
  };

  const setDefaultBillingAddress: ActionHook = async (request: Request, actionContext: ActionContext) => {
    assertIsAuthenticated(request);

    let account = fetchAccountFromSession(request);

    const address: Address = JSON.parse(request.body);

    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    account = await accountApi.setDefaultBillingAddress(account, address);

    return {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account,
      },
    } as Response;
  };

  const setDefaultShippingAddress: ActionHook = async (request: Request, actionContext: ActionContext) => {
    assertIsAuthenticated(request);

    let account = fetchAccountFromSession(request);

    const address: Address = JSON.parse(request.body);

    const accountApi = new AccountApi(actionContext.frontasticContext, getLocale(request));

    account = await accountApi.setDefaultShippingAddress(account, address);

    return {
      statusCode: 200,
      body: JSON.stringify(account),
      sessionData: {
        ...request.sessionData,
        account,
      },
    } as Response;
  };

  return {
    getAccount,
    register,
    requestConfirmationEmail,
    confirm,
    login,
    logout,
    password,
    requestReset,
    reset,
    update,
    addIsSubscribedType,
    updateSubscription,
    addAddress,
    addShippingAddress,
    addBillingAddress,
    updateAddress,
    removeAddress,
    setDefaultBillingAddress,
    setDefaultShippingAddress,
  };
};

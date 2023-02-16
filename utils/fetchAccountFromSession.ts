import { Request } from '@frontastic/extension-types';
import { AccountExtended as Account } from '../interfaces/AccountExtended';


export function fetchAccountFromSession(request: Request): Account | undefined {
  if (request.sessionData?.account !== undefined) {
    return request.sessionData.account;
  }

  return undefined;
}

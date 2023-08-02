import { ClientConfig } from '../interfaces/ClientConfig';

export const getConfig = (configuration: Record<string, string>): ClientConfig => {
  if (!configuration) throw 'Configuration not available';

  return {
    authUrl: configuration.EXTENSION_COMMERCETOOLS_AUTH_URL,
    clientId: configuration.EXTENSION_COMMERCETOOLS_CLIENT_ID,
    clientSecret: configuration.EXTENSION_COMMERCETOOLS_CLIENT_SECRET,
    hostUrl: configuration.EXTENSION_COMMERCETOOLS_HOST_URL,
    projectKey: configuration.EXTENSION_COMMERCETOOLS_PROJECT_KEY,
  } as ClientConfig;
};

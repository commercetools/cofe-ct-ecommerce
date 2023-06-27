# Commercetools Frontend Extensions

## NOTE:
This is **NOT** an official B2C extension code and **NOT** production ready. Use it at your own risk

## Install
```
yarn add cofe-ct-ecommerce
```

## Usage
Change the `index.ts` file of your controller to look like
```ts
import * as AccountActions from 'cofe-ct-ecommerce/actionControllers/AccountController'
// import rest of the controllers
...

export const actions = {
    account: AccountActions,
    ...
}

```

It's possible to import apis and utility classes and use them too
```ts
import { ProductApi } from 'cofe-ct-ecommerce/apis/ProductApi';
...

const productApi = new ProductApi(context, locale);
```

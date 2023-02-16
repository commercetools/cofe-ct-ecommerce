import { ActionHandler, Context, Request, Response } from '@frontastic/extension-types';
import { ActionContext } from '@frontastic/extension-types';
import { ProductQueryFactory } from '../utils/ProductQueryFactory';
import { ProductQuery } from '@commercetools/frontend-domain-types/query/ProductQuery';
import { CategoryQuery } from '../interfaces/CategoryQuery';
import { getLocale } from '../utils/Request';
import type { ProductApi as ProductApiType } from '../apis/ProductApi';

type ActionHook = (request: Request, actionContext: ActionContext) => Promise<Response>;

export const ProductController = ({ ProductApi }: { ProductApi: (new (context: Context, locale: string) => ProductApiType) }): ProductControllerType => {
  const getProduct: ActionHook = async (request: Request, actionContext: ActionContext) => {
    const productApi = new ProductApi(actionContext.frontasticContext, getLocale(request));

    let productQuery: ProductQuery = {};

    if ('id' in request.query) {
      productQuery = {
        productIds: [request.query['id']],
      };
    }

    if ('sku' in request.query) {
      productQuery = {
        skus: [request.query['sku']],
      };
    }

    const product = await productApi.getProduct(productQuery);

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(product),
      sessionData: request.sessionData,
    };

    return response;
  };

  const query: ActionHook = async (request: Request, actionContext: ActionContext) => {
    const productApi = new ProductApi(actionContext.frontasticContext, getLocale(request));

    const productQuery = ProductQueryFactory.queryFromParams(request);

    const queryResult = await productApi.query(productQuery);

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(queryResult),
      sessionData: request.sessionData,
    };

    return response;
  };

  const queryCategories: ActionHook = async (request: Request, actionContext: ActionContext) => {
    const productApi = new ProductApi(actionContext.frontasticContext, getLocale(request));

    const categoryQuery: CategoryQuery = {
      limit: request.query?.limit ?? undefined,
      cursor: request.query?.cursor ?? undefined,
      slug: request.query?.slug ?? undefined,
      parentId: request.query?.parentId ?? undefined,
    };

    const queryResult = await productApi.queryCategories(categoryQuery);

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(queryResult),
      sessionData: request.sessionData,
    };

    return response;
  };

  const searchableAttributes: ActionHook = async (request: Request, actionContext: ActionContext) => {
    const productApi = new ProductApi(actionContext.frontasticContext, getLocale(request));

    const result = await productApi.getSearchableAttributes();

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(result),
      sessionData: request.sessionData,
    };

    return response;
  };

  return {
    getProduct,
    query,
    queryCategories,
    searchableAttributes,
  };
};

export interface ProductControllerType {
  [actionIdentifier: string]: ActionHandler;
  getProduct: ActionHandler;
  query: ActionHandler;
  queryCategories: ActionHandler;
  searchableAttributes: ActionHandler;
};
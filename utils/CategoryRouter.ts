import { Context, Request } from '@frontastic/extension-types';
import { ProductApi } from '../apis/ProductApi';
import { getLocale, getPath } from './Request';
import { Result } from '@commercetools/frontend-domain-types/product/Result';
import { ProductQueryFactory } from './ProductQueryFactory';

export class CategoryRouter {
  static identifyFrom(request: Request) {
    if (getPath(request)?.match(/.+/)) {
      return true;
    }

    return false;
  }

  static loadFor = async (request: Request, frontasticContext: Context): Promise<Result> => {
    const productApi = new ProductApi(frontasticContext, getLocale(request));

    const chunks = getPath(request)?.split('/').filter(Boolean);

    if (chunks) {
      const categoryId = chunks[chunks.length - 1];

      request.query.category = categoryId;

      const productQuery = ProductQueryFactory.queryFromParams({
        ...request,
      });

      return await productApi.query(productQuery);
    }

    return null;
  };
}

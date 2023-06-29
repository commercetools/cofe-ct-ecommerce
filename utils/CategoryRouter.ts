import { Context, Request } from '@frontastic/extension-types';
import { ProductApi } from '../apis/ProductApi';
import { getLocale, getPath } from './Request';
import { Result } from '@commercetools/frontend-domain-types/product/Result';
import { ProductQueryFactory } from './ProductQueryFactory';
import { Category } from '@commercetools/frontend-domain-types/product/Category';

export class CategoryRouter {
  static identifyFrom(request: Request) {
    if (getPath(request)?.match(/.+/)) {
      return true;
    }

    return false;
  }

  static async loadFor(request: Request, frontasticContext: Context): Promise<Result> {
    const productApi = new ProductApi(frontasticContext, getLocale(request));

    const chunks = getPath(request)?.split('/').filter(Boolean);

    if (chunks) {
      const slug = chunks[chunks.length - 1];

      const response = await productApi.queryCategories({ slug });

      request.query.categories = [(response.items[0] as Category).categoryId];

      const productQuery = ProductQueryFactory.queryFromParams({
        ...request,
      });

      return await productApi.query(productQuery);
    }

    return null;
  }
}

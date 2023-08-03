import { Product } from '@commercetools/frontend-domain-types/product/Product';
import { Context, Request } from '@frontastic/extension-types';
import { ProductQuery } from '@commercetools/frontend-domain-types/query/ProductQuery';
import { ProductApi } from '../apis/ProductApi';
import { LineItem } from '@commercetools/frontend-domain-types/cart/LineItem';
import { getPath, getLocale, getCurrency } from './Request';
import { LineItem as WishlistItem } from '@commercetools/frontend-domain-types/wishlist/LineItem';

export class ProductRouter {
  static isProduct(product: Product | LineItem | WishlistItem): product is Product {
    return (product as Product).productId !== undefined;
  }

  static generateUrlFor(item: Product | LineItem | WishlistItem) {
    if (this.isProduct(item)) {
      return `/${item.slug}/p/${item.variants?.[0]?.sku}`;
    }
    return `/slug/p/${item.variant?.sku}`;
  }

  static identifyFrom(request: Request) {
    if (getPath(request)?.match(/\/p\/([^\/]+)/)) {
      return true;
    }

    return false;
  }

  static async loadFor(request: Request, frontasticContext: Context): Promise<Product> {
    const productApi = new ProductApi(frontasticContext, getLocale(request), getCurrency(request));

    const urlMatches = getPath(request)?.match(/\/p\/([^\/]+)/);

    if (urlMatches) {
      const productQuery: ProductQuery = {
        skus: [urlMatches[1]],
      };
      return productApi.getProduct(productQuery);
    }

    return null;
  }
}

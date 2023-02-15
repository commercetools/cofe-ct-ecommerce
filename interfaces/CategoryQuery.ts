import { CategoryQuery as BaseCategoryQuery } from '@commercetools/frontend-domain-types/query/CategoryQuery';

export interface CategoryQuery extends BaseCategoryQuery {
  parentId?: string;
}

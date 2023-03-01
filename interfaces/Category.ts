import { Category as DomainCategory } from '@commercetools/frontend-domain-types/product/Category';

export interface Category extends DomainCategory {
    subCategories?: Category[];
    path?: string;
}

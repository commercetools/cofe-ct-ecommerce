import { Money } from "@commercetools/frontend-domain-types/product/Money";

export const formatPrice = (money: Money, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: money.fractionDigits,
    maximumFractionDigits: money.fractionDigits,
  }).format(money.centAmount / 100);
};

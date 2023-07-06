export interface Inventory {
    quantityOnStock: number;
    availableQuantity?: number;
    expectedDelivery?: string;
    restockableInDays?: number;
  }
  
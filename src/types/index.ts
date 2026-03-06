export interface CalculationRecord {
  id: number;
  type: string;
  input: string;
  result: number;
  createdAt: string;
}

export interface DiscountInput {
  originalPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  quantity?: number;
}

export interface DiscountResult {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  savings: number;
  savingsPercentage: number;
}

export interface TaxInput {
  price: number;
  taxRate: number;
  includingTax?: boolean;
}

export interface TaxResult {
  priceBeforeTax: number;
  taxAmount: number;
  priceAfterTax: number;
  taxRate: number;
}

export interface ShippingInput {
  weight: number;
  length: number;
  width: number;
  height: number;
  zone: 'local' | 'national' | 'international';
  expedited?: boolean;
}

export interface ShippingResult {
  baseRate: number;
  weightCharge: number;
  dimensionalCharge: number;
  zoneMultiplier: number;
  expeditedSurcharge: number;
  totalCost: number;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  discountPercentage?: number;
}

export interface OrderInput {
  items: OrderItem[];
  taxRate: number;
  shippingCost: number;
  couponCode?: string;
  couponDiscount?: number;
}

export interface OrderResult {
  subtotal: number;
  itemDiscounts: number;
  couponDiscount: number;
  taxableAmount: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  savings: number;
}

export interface BasicCalcInput {
  a: number;
  b: number;
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
}

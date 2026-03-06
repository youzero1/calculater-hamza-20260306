import type {
  DiscountInput,
  DiscountResult,
  TaxInput,
  TaxResult,
  ShippingInput,
  ShippingResult,
  OrderInput,
  OrderResult,
  BasicCalcInput,
} from '@/types';

export function calculateDiscount(input: DiscountInput): DiscountResult {
  const { originalPrice, discountType, discountValue, quantity = 1 } = input;
  const totalOriginal = originalPrice * quantity;

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = (totalOriginal * discountValue) / 100;
  } else {
    discountAmount = Math.min(discountValue * quantity, totalOriginal);
  }

  const finalPrice = totalOriginal - discountAmount;
  const savingsPercentage =
    totalOriginal > 0 ? (discountAmount / totalOriginal) * 100 : 0;

  return {
    originalPrice: totalOriginal,
    discountAmount: round2(discountAmount),
    finalPrice: round2(finalPrice),
    savings: round2(discountAmount),
    savingsPercentage: round2(savingsPercentage),
  };
}

export function calculateTax(input: TaxInput): TaxResult {
  const { price, taxRate, includingTax = false } = input;

  let priceBeforeTax: number;
  let taxAmount: number;

  if (includingTax) {
    priceBeforeTax = price / (1 + taxRate / 100);
    taxAmount = price - priceBeforeTax;
  } else {
    priceBeforeTax = price;
    taxAmount = (price * taxRate) / 100;
  }

  return {
    priceBeforeTax: round2(priceBeforeTax),
    taxAmount: round2(taxAmount),
    priceAfterTax: round2(priceBeforeTax + taxAmount),
    taxRate,
  };
}

export function calculateShipping(input: ShippingInput): ShippingResult {
  const { weight, length, width, height, zone, expedited = false } = input;

  const zoneRates: Record<string, number> = {
    local: 1.0,
    national: 1.8,
    international: 3.5,
  };

  const baseRate = 3.99;
  const weightCharge = weight * 0.5;
  const dimensionalWeight = (length * width * height) / 139;
  const billableWeight = Math.max(weight, dimensionalWeight);
  const dimensionalCharge = billableWeight > weight ? (dimensionalWeight - weight) * 0.3 : 0;
  const zoneMultiplier = zoneRates[zone] || 1.0;
  const expeditedSurcharge = expedited ? 12.99 : 0;

  const totalCost =
    (baseRate + weightCharge + dimensionalCharge) * zoneMultiplier +
    expeditedSurcharge;

  return {
    baseRate: round2(baseRate),
    weightCharge: round2(weightCharge),
    dimensionalCharge: round2(dimensionalCharge),
    zoneMultiplier,
    expeditedSurcharge: round2(expeditedSurcharge),
    totalCost: round2(totalCost),
  };
}

export function calculateOrder(input: OrderInput): OrderResult {
  const { items, taxRate, shippingCost, couponDiscount = 0 } = input;

  let subtotal = 0;
  let itemDiscounts = 0;

  for (const item of items) {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    if (item.discountPercentage && item.discountPercentage > 0) {
      itemDiscounts += (lineTotal * item.discountPercentage) / 100;
    }
  }

  const afterItemDiscounts = subtotal - itemDiscounts;
  const afterCoupon = Math.max(0, afterItemDiscounts - couponDiscount);
  const taxAmount = (afterCoupon * taxRate) / 100;
  const total = afterCoupon + taxAmount + shippingCost;
  const savings = itemDiscounts + couponDiscount;

  return {
    subtotal: round2(subtotal),
    itemDiscounts: round2(itemDiscounts),
    couponDiscount: round2(couponDiscount),
    taxableAmount: round2(afterCoupon),
    taxAmount: round2(taxAmount),
    shippingCost: round2(shippingCost),
    total: round2(total),
    savings: round2(savings),
  };
}

export function basicCalculate(input: BasicCalcInput): number {
  const { a, b, operation } = input;
  switch (operation) {
    case 'add':
      return round2(a + b);
    case 'subtract':
      return round2(a - b);
    case 'multiply':
      return round2(a * b);
    case 'divide':
      if (b === 0) throw new Error('Division by zero');
      return round2(a / b);
    default:
      throw new Error('Invalid operation');
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

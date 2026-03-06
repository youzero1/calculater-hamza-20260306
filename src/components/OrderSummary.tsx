'use client';

import { useState } from 'react';
import type { OrderItem, OrderResult } from '@/types';

interface Props {
  onCalculation: () => void;
}

const defaultItem = (): OrderItem => ({
  name: '',
  price: 0,
  quantity: 1,
  discountPercentage: 0,
});

export default function OrderSummary({ onCalculation }: Props) {
  const [items, setItems] = useState<OrderItem[]>([defaultItem()]);
  const [taxRate, setTaxRate] = useState('8');
  const [shippingCost, setShippingCost] = useState('0');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('0');
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, defaultItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCalculate() {
    setError('');
    const validItems = items.filter((i) => i.name.trim() && i.price >= 0 && i.quantity > 0);
    if (validItems.length === 0) {
      setError('Add at least one valid item.');
      return;
    }
    const t = parseFloat(taxRate);
    const s = parseFloat(shippingCost);
    const cd = parseFloat(couponDiscount) || 0;
    if (isNaN(t) || t < 0 || t > 100) { setError('Enter a valid tax rate.'); return; }
    if (isNaN(s) || s < 0) { setError('Enter a valid shipping cost.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          input: {
            items: validItems,
            taxRate: t,
            shippingCost: s,
            couponCode,
            couponDiscount: cd,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed');
      setResult(data.data as OrderResult);
      onCalculation();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setItems([defaultItem()]);
    setTaxRate('8');
    setShippingCost('0');
    setCouponCode('');
    setCouponDiscount('0');
    setResult(null);
    setError('');
  }

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Order Summary Calculator</h2>
        <p className="text-sm text-gray-500 mt-1">
          Calculate the full order total including items, discounts, tax, and shipping.
        </p>
      </div>

      {/* Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="calc-label mb-0">Order Items</label>
          <button
            onClick={addItem}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <span className="text-lg leading-none">+</span> Add Item
          </button>
        </div>

        {items.map((item, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Item {idx + 1}</span>
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(idx)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  className="calc-input"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                />
              </div>
              <div>
                <input
                  type="number"
                  className="calc-input"
                  placeholder="Price $"
                  value={item.price || ''}
                  onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="calc-input"
                  placeholder="Qty"
                  value={item.quantity || ''}
                  onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  step="1"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="number"
                  className="calc-input"
                  placeholder="Discount % (optional)"
                  value={item.discountPercentage || ''}
                  onChange={(e) =>
                    updateItem(idx, 'discountPercentage', parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  max="100"
                  step="1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Settings */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="calc-label">Tax Rate (%)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="8"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <div>
          <label className="calc-label">Shipping Cost ($)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="0.00"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="calc-label">Coupon Code (optional)</label>
          <input
            type="text"
            className="calc-input"
            placeholder="e.g. SAVE10"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
        </div>
        <div>
          <label className="calc-label">Coupon Discount ($)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="0.00"
            value={couponDiscount}
            onChange={(e) => setCouponDiscount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button className="calc-btn" onClick={handleCalculate} disabled={loading}>
          {loading ? 'Calculating…' : 'Calculate Order Total'}
        </button>
        <button className="calc-btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

      {result && (
        <div className="result-card">
          <p className="text-sm text-blue-700 font-medium mb-3">Order Summary</p>
          <div className="space-y-1">
            <div className="result-row">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{fmt(result.subtotal)}</span>
            </div>
            {result.itemDiscounts > 0 && (
              <div className="result-row">
                <span className="text-gray-600">Item Discounts</span>
                <span className="font-medium text-green-600">− {fmt(result.itemDiscounts)}</span>
              </div>
            )}
            {result.couponDiscount > 0 && (
              <div className="result-row">
                <span className="text-gray-600">
                  Coupon {couponCode ? `(${couponCode})` : ''}
                </span>
                <span className="font-medium text-green-600">− {fmt(result.couponDiscount)}</span>
              </div>
            )}
            <div className="result-row">
              <span className="text-gray-600">Taxable Amount</span>
              <span className="font-medium">{fmt(result.taxableAmount)}</span>
            </div>
            <div className="result-row">
              <span className="text-gray-600">Tax ({taxRate}%)</span>
              <span className="font-medium text-orange-600">+ {fmt(result.taxAmount)}</span>
            </div>
            <div className="result-row">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">+ {fmt(result.shippingCost)}</span>
            </div>
            {result.savings > 0 && (
              <div className="result-row">
                <span className="text-green-700 font-medium">Total Savings</span>
                <span className="font-medium text-green-700">{fmt(result.savings)}</span>
              </div>
            )}
          </div>
          <div className="result-total">
            <span className="text-gray-900">Order Total</span>
            <span className="text-blue-700 text-xl">{fmt(result.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

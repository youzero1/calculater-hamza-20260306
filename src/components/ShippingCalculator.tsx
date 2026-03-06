'use client';

import { useState } from 'react';
import type { ShippingResult, ShippingInput } from '@/types';

interface Props {
  onCalculation: () => void;
}

export default function ShippingCalculator({ onCalculation }: Props) {
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [zone, setZone] = useState<ShippingInput['zone']>('national');
  const [expedited, setExpedited] = useState(false);
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCalculate() {
    setError('');
    const w = parseFloat(weight);
    const l = parseFloat(length);
    const wi = parseFloat(width);
    const h = parseFloat(height);

    if (isNaN(w) || w <= 0) { setError('Enter a valid weight.'); return; }
    if (isNaN(l) || l <= 0) { setError('Enter a valid length.'); return; }
    if (isNaN(wi) || wi <= 0) { setError('Enter a valid width.'); return; }
    if (isNaN(h) || h <= 0) { setError('Enter a valid height.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'shipping',
          input: { weight: w, length: l, width: wi, height: h, zone, expedited },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed');
      setResult(data.data as ShippingResult);
      onCalculation();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setWeight('');
    setLength('');
    setWidth('');
    setHeight('');
    setZone('national');
    setExpedited(false);
    setResult(null);
    setError('');
  }

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const zones: { id: ShippingInput['zone']; label: string; desc: string }[] = [
    { id: 'local', label: 'Local', desc: 'Same city/region' },
    { id: 'national', label: 'National', desc: 'Within country' },
    { id: 'international', label: 'International', desc: 'Cross-border' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Shipping Cost Calculator</h2>
        <p className="text-sm text-gray-500 mt-1">
          Estimate shipping based on package dimensions, weight, and zone.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="calc-label">Weight (lbs)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="5.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>
        <div>
          <label className="calc-label">Length (in)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="12"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>
        <div>
          <label className="calc-label">Width (in)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="8"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>
        <div>
          <label className="calc-label">Height (in)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="6"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="calc-label">Shipping Zone</label>
        <div className="grid grid-cols-3 gap-2">
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => setZone(z.id)}
              className={`p-3 rounded-lg text-sm border text-left transition-colors ${
                zone === z.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{z.label}</div>
              <div className={`text-xs mt-0.5 ${zone === z.id ? 'text-blue-100' : 'text-gray-400'}`}>
                {z.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setExpedited(!expedited)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              expedited ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                expedited ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Expedited Shipping (+$12.99)
          </span>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button className="calc-btn" onClick={handleCalculate} disabled={loading}>
          {loading ? 'Calculating…' : 'Calculate Shipping'}
        </button>
        <button className="calc-btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

      {result && (
        <div className="result-card">
          <p className="text-sm text-blue-700 font-medium mb-3">Shipping Breakdown</p>
          <div className="space-y-1">
            <div className="result-row">
              <span className="text-gray-600">Base Rate</span>
              <span className="font-medium">{fmt(result.baseRate)}</span>
            </div>
            <div className="result-row">
              <span className="text-gray-600">Weight Charge</span>
              <span className="font-medium">{fmt(result.weightCharge)}</span>
            </div>
            {result.dimensionalCharge > 0 && (
              <div className="result-row">
                <span className="text-gray-600">Dimensional Surcharge</span>
                <span className="font-medium">{fmt(result.dimensionalCharge)}</span>
              </div>
            )}
            <div className="result-row">
              <span className="text-gray-600">Zone Multiplier</span>
              <span className="font-medium">× {result.zoneMultiplier}</span>
            </div>
            {result.expeditedSurcharge > 0 && (
              <div className="result-row">
                <span className="text-gray-600">Expedited Surcharge</span>
                <span className="font-medium">{fmt(result.expeditedSurcharge)}</span>
              </div>
            )}
          </div>
          <div className="result-total">
            <span className="text-gray-900">Total Shipping Cost</span>
            <span className="text-blue-700 text-xl">{fmt(result.totalCost)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

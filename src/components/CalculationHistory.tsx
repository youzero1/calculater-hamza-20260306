'use client';

import { useEffect, useState, useCallback } from 'react';
import type { CalculationRecord } from '@/types';

interface Props {
  refreshTrigger: number;
}

const typeColors: Record<string, string> = {
  basic: 'bg-gray-100 text-gray-700',
  discount: 'bg-green-100 text-green-700',
  tax: 'bg-orange-100 text-orange-700',
  shipping: 'bg-blue-100 text-blue-700',
  order: 'bg-purple-100 text-purple-700',
};

const typeIcons: Record<string, string> = {
  basic: '🔢',
  discount: '🏷️',
  tax: '📊',
  shipping: '📦',
  order: '🛒',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatResult(record: CalculationRecord): string {
  const val = record.result;
  if (record.type === 'basic') return val.toString();
  return val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function parseInputSummary(record: CalculationRecord): string {
  try {
    const inp = JSON.parse(record.input);
    if (record.type === 'basic') {
      const symbols: Record<string, string> = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
      return `${inp.a} ${symbols[inp.operation] || inp.operation} ${inp.b}`;
    }
    if (record.type === 'discount') {
      return `$${inp.originalPrice} × ${inp.quantity || 1} @ ${inp.discountValue}${inp.discountType === 'percentage' ? '%' : '$'} off`;
    }
    if (record.type === 'tax') {
      return `$${inp.price} @ ${inp.taxRate}% tax`;
    }
    if (record.type === 'shipping') {
      return `${inp.weight}lbs, ${inp.zone}`;
    }
    if (record.type === 'order') {
      return `${inp.items?.length || 0} items, ${inp.taxRate}% tax`;
    }
    return '';
  } catch {
    return '';
  }
}

export default function CalculationHistory({ refreshTrigger }: Props) {
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  async function handleClear() {
    if (!confirm('Clear all calculation history?')) return;
    setClearing(true);
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
    } catch {
      // silent
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-fit sticky top-24">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Calculation History</h3>
          <p className="text-xs text-gray-500">{history.length} record{history.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchHistory}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Refresh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="p-1.5 text-red-400 hover:text-red-600 rounded transition-colors disabled:opacity-50"
              title="Clear history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
            <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading…
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm font-medium text-gray-500">No calculations yet</p>
            <p className="text-xs text-gray-400 mt-1">Your history will appear here</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {history.map((record) => (
              <li key={record.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-base mt-0.5 flex-shrink-0">
                      {typeIcons[record.type] || '🔢'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${
                            typeColors[record.type] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {record.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {parseInputSummary(record)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-gray-900">
                      {formatResult(record)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Calculator from '@/components/Calculator';
import DiscountCalculator from '@/components/DiscountCalculator';
import TaxCalculator from '@/components/TaxCalculator';
import ShippingCalculator from '@/components/ShippingCalculator';
import OrderSummary from '@/components/OrderSummary';
import CalculationHistory from '@/components/CalculationHistory';

export type TabType = 'basic' | 'discount' | 'tax' | 'shipping' | 'order';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const refreshHistory = () => setHistoryRefresh((n) => n + 1);

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Calculator Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {activeTab === 'basic' && (
                <Calculator onCalculation={refreshHistory} />
              )}
              {activeTab === 'discount' && (
                <DiscountCalculator onCalculation={refreshHistory} />
              )}
              {activeTab === 'tax' && (
                <TaxCalculator onCalculation={refreshHistory} />
              )}
              {activeTab === 'shipping' && (
                <ShippingCalculator onCalculation={refreshHistory} />
              )}
              {activeTab === 'order' && (
                <OrderSummary onCalculation={refreshHistory} />
              )}
            </div>
          </div>

          {/* History Sidebar */}
          <div className="lg:w-80 xl:w-96">
            <CalculationHistory refreshTrigger={historyRefresh} />
          </div>
        </div>
      </main>
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200 bg-white">
        © {new Date().getFullYear()} Calculater – E-Commerce Calculator Tool
      </footer>
    </div>
  );
}

'use client';

import type { TabType } from '@/app/page';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'basic', label: 'Basic', icon: '🔢' },
  { id: 'discount', label: 'Discount', icon: '🏷️' },
  { id: 'tax', label: 'Tax / VAT', icon: '📊' },
  { id: 'shipping', label: 'Shipping', icon: '📦' },
  { id: 'order', label: 'Order Total', icon: '🛒' },
];

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">
                Calculater
              </h1>
              <p className="text-xs text-gray-500">E-Commerce Calculator</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

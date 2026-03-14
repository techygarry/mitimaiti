'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
  className?: string;
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className,
}: TabsProps) {
  const [active, setActive] = useState(activeTab || tabs[0]?.id);

  const handleChange = (tabId: string) => {
    setActive(tabId);
    onChange(tabId);
  };

  const currentTab = activeTab || active;

  if (variant === 'pills') {
    return (
      <div
        className={clsx(
          'flex gap-2 p-1 bg-gray-100 rounded-xl',
          className
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={clsx(
              'relative flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              currentTab === tab.id
                ? 'text-white'
                : 'text-textLight hover:text-textMain'
            )}
          >
            {currentTab === tab.id && (
              <motion.div
                layoutId="pill-tab"
                className="absolute inset-0 bg-rose rounded-lg"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={clsx(
                    'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold rounded-full',
                    currentTab === tab.id
                      ? 'bg-white text-rose'
                      : 'bg-rose text-white'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('flex border-b border-gray-200', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          className={clsx(
            'relative flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200',
            currentTab === tab.id
              ? 'text-rose'
              : 'text-textLight hover:text-textMain'
          )}
        >
          <span className="flex items-center justify-center gap-1.5">
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full bg-rose text-white">
                {tab.badge}
              </span>
            )}
          </span>
          {currentTab === tab.id && (
            <motion.div
              layoutId="underline-tab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

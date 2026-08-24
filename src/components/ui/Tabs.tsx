'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useId,
} from 'react';
import { cn } from '@/lib/utils';

export type TabsVariant = 'pills' | 'underline';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: TabsVariant;
  baseId: string;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a <Tabs> parent.');
  }
  return context;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
}

export function Tabs({
  value,
  defaultValue = '',
  onValueChange,
  variant = 'pills',
  className,
  children,
  ...props
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const baseId = useId();

  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setInternalTab(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab, variant, baseId }}
    >
      <div className={cn('w-full flex flex-col', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  'aria-label'?: string;
}

export function TabList({
  className,
  'aria-label': ariaLabel,
  children,
  ...props
}: TabListProps) {
  const { variant } = useTabs();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!listRef.current) return;
    const tabs = Array.from(
      listRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
    );
    if (tabs.length === 0) return;

    const currentIndex = tabs.findIndex((t) => t === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex items-center',
        variant === 'pills' &&
          'bg-slate-100/90 p-1 rounded-xl gap-1 border border-slate-200/80 overflow-x-auto no-scrollbar',
        variant === 'underline' &&
          'border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function Tab({
  value,
  icon,
  badge,
  className,
  children,
  disabled,
  ...props
}: TabProps) {
  const { activeTab, setActiveTab, variant, baseId } = useTabs();
  const isSelected = activeTab === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      id={tabId}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 whitespace-nowrap select-none min-h-[36px] touch-manipulation',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1',
        variant === 'pills' && [
          'px-3.5 py-1.5 text-xs sm:text-sm rounded-lg gap-2',
          isSelected
            ? 'bg-white text-indigo-600 shadow-sm font-semibold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
        ],
        variant === 'underline' && [
          'px-1 py-3 text-sm border-b-2 gap-2 -mb-[1px]',
          isSelected
            ? 'border-indigo-600 text-indigo-600 font-semibold'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
        ],
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {badge && <span className="inline-flex shrink-0 ml-1">{badge}</span>}
    </button>
  );
}

export interface TabPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabPanel({
  value,
  className,
  children,
  ...props
}: TabPanelProps) {
  const { activeTab, baseId } = useTabs();
  const isSelected = activeTab === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  if (!isSelected) return null;

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
      className={cn('pt-4 focus:outline-none animate-in fade-in duration-150', className)}
      {...props}
    >
      {children}
    </div>
  );
}

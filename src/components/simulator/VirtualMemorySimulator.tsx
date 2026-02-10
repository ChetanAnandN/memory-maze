/**
 * Virtual Memory Simulator - Main Component
 * 
 * This is the main component that orchestrates the entire Virtual Memory
 * Management simulation dashboard. It includes:
 * 
 * 1. Page Replacement - FIFO, LRU, Optimal algorithms
 * 2. Address Translation - Logical to Physical address conversion
 * 3. Demand Paging - Loading pages from disk to RAM on demand
 * 4. Thrashing Monitor - Detecting and understanding thrashing
 * 5. TLB Simulation - Translation Lookaside Buffer caching
 * 
 * Educational Tool for Operating Systems concepts
 */

import React, { useState, useEffect } from 'react';
import { Moon, Sun, FileText, Zap, HardDrive, AlertTriangle, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import tab components
import PageReplacementTab from './PageReplacementTab';
import AddressTranslationTab from './AddressTranslationTab';
import DemandPagingTab from './DemandPagingTab';
import ThrashingMonitorTab from './ThrashingMonitorTab';
import TLBSimulationTab from './TLBSimulationTab';

// Tab configuration with icons
const tabs = [
  { id: 'page-replacement', label: 'Page Replacement', icon: FileText },
  { id: 'address-translation', label: 'Address Translation', icon: Zap },
  { id: 'demand-paging', label: 'Demand Paging', icon: HardDrive },
  { id: 'thrashing', label: 'Thrashing Monitor', icon: AlertTriangle },
  { id: 'tlb', label: 'TLB Simulation', icon: Cpu }
];

const VirtualMemorySimulator: React.FC = () => {
  // Theme state - defaults to dark mode
  const [darkMode, setDarkMode] = useState(true);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('page-replacement');

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  /**
   * Renders the content for the currently active tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'page-replacement':
        return <PageReplacementTab darkMode={darkMode} />;
      case 'address-translation':
        return <AddressTranslationTab darkMode={darkMode} />;
      case 'demand-paging':
        return <DemandPagingTab darkMode={darkMode} />;
      case 'thrashing':
        return <ThrashingMonitorTab darkMode={darkMode} />;
      case 'tlb':
        return <TLBSimulationTab darkMode={darkMode} />;
      default:
        return <PageReplacementTab darkMode={darkMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Virtual Memory Dashboard
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Interactive Operating Systems Learning Tool
              </p>
            </div>
            
            {/* Dark/Light Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`sim-tab ${isActive ? 'sim-tab-active' : 'sim-tab-inactive'}`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Virtual Memory Management Simulator • Educational Tool for OS Concepts
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VirtualMemorySimulator;

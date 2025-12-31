/**
 * TLB (Translation Lookaside Buffer) Simulation Tab
 * 
 * This tab demonstrates how a TLB speeds up address translation
 * by caching recently used page-to-frame mappings.
 * 
 * Key concepts:
 * - TLB is a small, fast cache of page table entries
 * - TLB Hit: Page mapping found in TLB (very fast)
 * - TLB Miss: Must access page table in memory (slower)
 * - Uses FIFO replacement when TLB is full
 */

import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TLBEntry, PageTableEntry } from './types';

interface TLBSimulationTabProps {
  darkMode: boolean;
}

const TLBSimulationTab: React.FC<TLBSimulationTabProps> = ({ darkMode }) => {
  // TLB cache (4 entries, as specified)
  const [tlbCache, setTlbCache] = useState<TLBEntry[]>([]);
  
  // Statistics
  const [tlbHits, setTlbHits] = useState(0);
  const [tlbMisses, setTlbMisses] = useState(0);
  
  // User input
  const [tlbLookupPage, setTlbLookupPage] = useState('');
  
  // Page table (backing store for TLB misses)
  const [pageTable, setPageTable] = useState<PageTableEntry[]>([]);
  
  // Operation history
  const [lookupHistory, setLookupHistory] = useState<Array<{
    page: number;
    result: 'hit' | 'miss';
    frame?: number;
  }>>([]);

  // Initialize page table on mount
  useEffect(() => {
    const table: PageTableEntry[] = Array.from({ length: 16 }, (_, i) => ({
      page: i,
      frame: Math.floor(Math.random() * 16),
      valid: Math.random() > 0.3
    }));
    setPageTable(table);
  }, []);

  /**
   * Performs a TLB lookup for the given page
   * 
   * Process:
   * 1. Check if page is in TLB (hit)
   * 2. If not, check page table (miss)
   * 3. If valid in page table, add to TLB
   * 4. If TLB full, evict oldest entry (FIFO)
   */
  const tlbLookup = () => {
    const page = parseInt(tlbLookupPage);
    if (isNaN(page) || page < 0 || page > 15) {
      return;
    }

    // Check TLB first
    const tlbEntry = tlbCache.find(entry => entry.page === page);
    
    if (tlbEntry) {
      // TLB HIT - found in cache
      setTlbHits(prev => prev + 1);
      setLookupHistory(prev => [...prev, { 
        page, 
        result: 'hit', 
        frame: tlbEntry.frame 
      }]);
    } else {
      // TLB MISS - need to check page table
      setTlbMisses(prev => prev + 1);
      
      const pageEntry = pageTable.find(p => p.page === page);
      
      if (pageEntry && pageEntry.valid) {
        // Valid entry in page table - add to TLB
        const newCache = [...tlbCache];
        
        if (newCache.length >= 4) {
          // TLB full - evict oldest (FIFO)
          newCache.shift();
        }
        
        newCache.push({ page: page, frame: pageEntry.frame });
        setTlbCache(newCache);
        
        setLookupHistory(prev => [...prev, { 
          page, 
          result: 'miss', 
          frame: pageEntry.frame 
        }]);
      } else {
        // Page fault - not in page table
        setLookupHistory(prev => [...prev, { 
          page, 
          result: 'miss' 
        }]);
      }
    }
    
    setTlbLookupPage('');
  };

  /**
   * Resets TLB and statistics
   */
  const resetTLB = () => {
    setTlbCache([]);
    setTlbHits(0);
    setTlbMisses(0);
    setLookupHistory([]);
  };

  // Calculate hit rate
  const totalLookups = tlbHits + tlbMisses;
  const hitRate = totalLookups > 0 
    ? ((tlbHits / totalLookups) * 100).toFixed(2) 
    : '0.00';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* TLB Cache Visualization */}
      <div className="sim-panel">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Cpu className="text-primary" size={24} />
          TLB Cache (4 entries max)
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          The TLB caches recent page-to-frame mappings for faster address translation.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, idx) => {
            const entry = tlbCache[idx];
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 text-center transition-all duration-300 ${
                  entry
                    ? 'bg-primary/20 border-primary/50'
                    : 'bg-muted/30 border-border'
                }`}
              >
                <span className="text-xs text-muted-foreground block mb-2">
                  Entry {idx}
                </span>
                {entry ? (
                  <>
                    <div className="text-sm text-muted-foreground">Page {entry.page}</div>
                    <div className="text-xl font-bold text-primary">
                      → Frame {entry.frame}
                    </div>
                  </>
                ) : (
                  <div className="text-2xl text-muted-foreground/50">—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="sim-panel">
        <h2 className="text-xl font-semibold mb-4">TLB Statistics</h2>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-secondary">
            <div className="text-sm text-muted-foreground mb-1">TLB Hits</div>
            <div className="text-3xl font-bold text-success">{tlbHits}</div>
          </div>
          <div className="p-4 rounded-lg bg-secondary">
            <div className="text-sm text-muted-foreground mb-1">TLB Misses</div>
            <div className="text-3xl font-bold text-destructive">{tlbMisses}</div>
          </div>
          <div className="p-4 rounded-lg bg-secondary">
            <div className="text-sm text-muted-foreground mb-1">Hit Rate</div>
            <div className="text-3xl font-bold text-primary">{hitRate}%</div>
          </div>
        </div>

        {/* Lookup Controls */}
        <div className="flex gap-3 flex-wrap">
          <Input
            type="number"
            value={tlbLookupPage}
            onChange={(e) => setTlbLookupPage(e.target.value)}
            placeholder="Enter page number (0-15)"
            className="flex-1 min-w-[200px]"
            min={0}
            max={15}
            onKeyDown={(e) => e.key === 'Enter' && tlbLookup()}
          />
          <Button onClick={tlbLookup}>
            Lookup
          </Button>
          <Button variant="secondary" onClick={resetTLB}>
            Reset TLB
          </Button>
        </div>

        {/* Quick Lookup Buttons */}
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Quick lookup:</p>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => {
                  setTlbLookupPage(i.toString());
                }}
              >
                Page {i}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Lookup History */}
      {lookupHistory.length > 0 && (
        <div className="sim-panel">
          <h2 className="text-xl font-semibold mb-4">Lookup History</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {lookupHistory.slice(-10).reverse().map((entry, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg flex items-center justify-between ${
                  entry.result === 'hit' 
                    ? 'bg-success/10 border border-success/30' 
                    : 'bg-destructive/10 border border-destructive/30'
                }`}
              >
                <span className="font-medium">Page {entry.page}</span>
                <span className={`font-semibold ${
                  entry.result === 'hit' ? 'text-success' : 'text-destructive'
                }`}>
                  {entry.result === 'hit' ? 'TLB HIT' : 'TLB MISS'}
                  {entry.frame !== undefined && ` → Frame ${entry.frame}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="sim-panel bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Cpu className="text-primary" size={18} />
          How the TLB Works
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>
            <strong>Purpose:</strong> Cache frequently used page table entries for faster lookup
          </li>
          <li>
            <strong>TLB Hit:</strong> Page mapping found in TLB → Very fast (no memory access)
          </li>
          <li>
            <strong>TLB Miss:</strong> Must access page table in memory → Slower, then cache the mapping
          </li>
          <li>
            <strong>Hit Rate Goal:</strong> Higher is better. Modern systems achieve 95-99% hit rates
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TLBSimulationTab;

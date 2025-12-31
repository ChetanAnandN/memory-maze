/**
 * Address Translation Tab Component
 * 
 * This tab demonstrates how logical (virtual) addresses are translated
 * to physical addresses using a page table.
 * 
 * Key concepts:
 * - Logical Address = Page Number + Offset
 * - Physical Address = Frame Number + Offset
 * - Page Table maps pages to frames
 */

import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageTableEntry, TranslationResult } from './types';

interface AddressTranslationTabProps {
  darkMode: boolean;
}

const AddressTranslationTab: React.FC<AddressTranslationTabProps> = ({ darkMode }) => {
  // Input state
  const [logicalAddress, setLogicalAddress] = useState('');
  const [pageSize, setPageSize] = useState(256);
  
  // Output state
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [pageTable, setPageTable] = useState<PageTableEntry[]>([]);

  // Initialize page table with random mappings on mount
  useEffect(() => {
    const table: PageTableEntry[] = Array.from({ length: 16 }, (_, i) => ({
      page: i,
      frame: Math.floor(Math.random() * 16),
      valid: Math.random() > 0.3 // 70% chance of being valid
    }));
    setPageTable(table);
  }, []);

  /**
   * Translates a logical address to a physical address
   * 
   * Formula:
   * - Page Number = Logical Address / Page Size (integer division)
   * - Offset = Logical Address % Page Size (remainder)
   * - Physical Address = (Frame Number * Page Size) + Offset
   */
  const translateAddress = () => {
    const addr = parseInt(logicalAddress);
    if (isNaN(addr) || addr < 0) return;

    // Calculate page number and offset
    const pageNum = Math.floor(addr / pageSize);
    const offset = addr % pageSize;
    
    // Look up the page in the page table
    const pageEntry = pageTable.find(p => p.page === pageNum);
    
    if (pageEntry && pageEntry.valid) {
      // Valid mapping found - calculate physical address
      const frameNum = pageEntry.frame;
      const physicalAddr = frameNum * pageSize + offset;
      
      setTranslationResult({
        logicalAddress: addr,
        pageNumber: pageNum,
        offset: offset,
        frameNumber: frameNum,
        physicalAddress: physicalAddr
      });
    } else {
      // Page not valid - PAGE FAULT!
      setTranslationResult({
        logicalAddress: addr,
        pageNumber: pageNum,
        offset: offset,
        frameNumber: 'Page Fault',
        physicalAddress: 'Invalid'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Input Panel */}
      <div className="sim-panel">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="text-primary" size={24} />
          Address Translation Input
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Logical address input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Logical Address (decimal)
            </label>
            <Input
              type="number"
              value={logicalAddress}
              onChange={(e) => setLogicalAddress(e.target.value)}
              placeholder="Enter logical address (e.g., 1024)"
              min={0}
            />
            <p className="text-xs text-muted-foreground mt-1">
              The virtual address from the process's perspective
            </p>
          </div>

          {/* Page size selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Page Size
            </label>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(v) => setPageSize(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="256">256 bytes</SelectItem>
                <SelectItem value="512">512 bytes</SelectItem>
                <SelectItem value="1024">1 KB</SelectItem>
                <SelectItem value="4096">4 KB</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Size of each page/frame in memory
            </p>
          </div>
        </div>

        <Button onClick={translateAddress} className="mt-4">
          Translate Address
        </Button>
      </div>

      {/* Translation Result */}
      {translationResult && (
        <div className="sim-panel animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">Translation Result</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Logical Address', value: translationResult.logicalAddress, color: 'text-primary' },
              { label: 'Page Number', value: translationResult.pageNumber, color: 'text-foreground' },
              { label: 'Offset', value: translationResult.offset, color: 'text-foreground' },
              { 
                label: 'Frame Number', 
                value: translationResult.frameNumber,
                color: translationResult.frameNumber === 'Page Fault' ? 'text-destructive' : 'text-success'
              },
              { 
                label: 'Physical Address', 
                value: translationResult.physicalAddress,
                color: translationResult.physicalAddress === 'Invalid' ? 'text-destructive' : 'text-success'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-secondary">
                <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Visual explanation */}
          <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium mb-2">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Page Number = {translationResult.logicalAddress} ÷ {pageSize} = {translationResult.pageNumber}</li>
              <li>Offset = {translationResult.logicalAddress} mod {pageSize} = {translationResult.offset}</li>
              {translationResult.physicalAddress !== 'Invalid' && (
                <li>Physical Address = ({translationResult.frameNumber} × {pageSize}) + {translationResult.offset} = {translationResult.physicalAddress}</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Page Table */}
      <div className="sim-panel">
        <h2 className="text-xl font-semibold mb-4">Page Table</h2>
        <p className="text-sm text-muted-foreground mb-4">
          The page table maps virtual page numbers to physical frame numbers.
          Invalid entries indicate pages not currently in memory.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="p-3 text-left font-semibold">Page #</th>
                <th className="p-3 text-left font-semibold">Frame #</th>
                <th className="p-3 text-left font-semibold">Valid Bit</th>
              </tr>
            </thead>
            <tbody>
              {pageTable.slice(0, 10).map((entry, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b border-border/50 transition-colors ${
                    translationResult?.pageNumber === entry.page 
                      ? 'bg-primary/10' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <td className="p-3 font-mono">{entry.page}</td>
                  <td className="p-3 font-mono">{entry.frame}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.valid 
                        ? 'bg-success/20 text-success' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {entry.valid ? '✓ Valid' : '✗ Invalid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3">
          Showing first 10 entries. In real systems, page tables can have thousands of entries.
        </p>
      </div>
    </div>
  );
};

export default AddressTranslationTab;

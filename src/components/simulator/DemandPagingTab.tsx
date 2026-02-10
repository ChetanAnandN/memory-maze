/**
 * Demand Paging Tab Component
 * 
 * This tab demonstrates demand paging - pages are loaded from disk
 * to RAM only when they are needed (on demand), not in advance.
 * 
 * Key concepts:
 * - Pages initially reside on disk
 * - When a page is requested, it's loaded into a RAM frame
 * - If RAM is full, a victim page is selected and swapped out
 */

import React, { useState } from 'react';
import { HardDrive, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DemandPagingTabProps {
  darkMode: boolean;
}

const DemandPagingTab: React.FC<DemandPagingTabProps> = ({ darkMode }) => {
  // Disk contains all available pages
  const [diskPages, setDiskPages] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7]);
  
  // RAM frames (4 frames, initially empty)
  const [ramFrames, setRamFrames] = useState<(number | null)[]>(Array(4).fill(null));
  
  // User input for page request
  const [requestPage, setRequestPage] = useState('');
  
  // Log of operations
  const [operationLog, setOperationLog] = useState<string[]>([]);
  
  // FIFO queue to track the order pages were loaded into RAM
  const [fifoQueue, setFifoQueue] = useState<number[]>([]);

  /**
   * Handles a page request from the user
   * 
   * If the page is on disk:
   * 1. Find an empty frame in RAM, or
   * 2. If RAM is full, randomly select a victim to swap out
   * 3. Load the requested page into the frame
   */
  const handlePageRequest = () => {
    const page = parseInt(requestPage);
    
    // Validate input
    if (isNaN(page)) {
      setOperationLog(prev => [...prev, `Error: Please enter a valid page number`]);
      return;
    }
    
    // Check if page is on disk
    if (!diskPages.includes(page)) {
      // Check if already in RAM
      if (ramFrames.includes(page)) {
        setOperationLog(prev => [...prev, `Page ${page} is already in RAM - No page fault!`]);
      } else {
        setOperationLog(prev => [...prev, `Error: Page ${page} doesn't exist`]);
      }
      setRequestPage('');
      return;
    }

    // Find an empty frame
    const emptyFrameIdx = ramFrames.findIndex(f => f === null);
    
    if (emptyFrameIdx !== -1) {
      // Empty frame available - load page directly
      const newFrames = [...ramFrames];
      newFrames[emptyFrameIdx] = page;
      setRamFrames(newFrames);
      setDiskPages(diskPages.filter(p => p !== page));
      setFifoQueue(prev => [...prev, page]);
      setOperationLog(prev => [
        ...prev, 
        `Page ${page} loaded into Frame ${emptyFrameIdx} (empty frame available)`
      ]);
    } else {
      // RAM is full - use FIFO to select victim (oldest page loaded)
      const victim = fifoQueue[0]; // Oldest page in the queue
      const victimIdx = ramFrames.indexOf(victim);
      const newFrames = [...ramFrames];
      newFrames[victimIdx] = page;
      setRamFrames(newFrames);
      setFifoQueue(prev => [...prev.slice(1), page]); // Remove oldest, add new
      
      // Update disk: remove new page, add victim back
      setDiskPages(
        [...diskPages.filter(p => p !== page), victim as number].sort((a, b) => a - b)
      );
      
      setOperationLog(prev => [
        ...prev, 
        `Page ${page} loaded into Frame ${victimIdx}. Page ${victim} swapped out to disk (FIFO - oldest page).`
      ]);
    }
    
    setRequestPage('');
  };

  /**
   * Resets the simulation to initial state
   */
  const resetDemandPaging = () => {
    setDiskPages([0, 1, 2, 3, 4, 5, 6, 7]);
    setRamFrames(Array(4).fill(null));
    setOperationLog([]);
    setFifoQueue([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Disk Section */}
      <div className="sim-panel">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HardDrive size={24} className="text-sim-purple" />
          Disk (Secondary Storage)
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          All pages start on disk. They're loaded into RAM only when requested.
        </p>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {diskPages.length > 0 ? (
            diskPages.map(page => (
              <div
                key={page}
                className="p-4 rounded-lg text-center font-bold text-lg bg-purple-500/20 border-2 border-purple-500/50 text-purple-400"
              >
                {page}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-muted-foreground">
              All pages are in RAM
            </div>
          )}
        </div>
      </div>

      {/* RAM Section */}
      <div className="sim-panel">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Cpu size={24} className="text-success" />
          RAM (Physical Memory Frames)
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          RAM has limited frames. When full, pages must be swapped out to make room.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {ramFrames.map((frame, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-lg text-center font-bold text-2xl transition-all duration-300 ${
                frame !== null
                  ? 'bg-success/20 border-2 border-success/50 text-success'
                  : 'bg-muted/30 border-2 border-border text-muted-foreground'
              }`}
            >
              <span className="text-xs text-muted-foreground block mb-1">
                Frame {idx}
              </span>
              {frame !== null ? `Page ${frame}` : '—'}
            </div>
          ))}
        </div>

        {/* Request Controls */}
        <div className="flex gap-3 flex-wrap">
          <Input
            type="number"
            value={requestPage}
            onChange={(e) => setRequestPage(e.target.value)}
            placeholder="Enter page number (0-7)"
            className="flex-1 min-w-[200px]"
            onKeyDown={(e) => e.key === 'Enter' && handlePageRequest()}
          />
          <Button onClick={handlePageRequest}>
            Request Page
          </Button>
          <Button variant="secondary" onClick={resetDemandPaging}>
            Reset
          </Button>
        </div>

        {/* Quick Request Buttons */}
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Quick request:</p>
          <div className="flex gap-2 flex-wrap">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(page => (
              <Button
                key={page}
                variant="outline"
                size="sm"
                onClick={() => {
                  setRequestPage(page.toString());
                }}
                disabled={ramFrames.includes(page)}
                className={ramFrames.includes(page) ? 'opacity-50' : ''}
              >
                Page {page}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Operation Log */}
      <div className="sim-panel">
        <h2 className="text-xl font-semibold mb-4">Operation Log</h2>
        <div className="bg-muted/30 rounded-lg p-4 max-h-60 overflow-y-auto">
          {operationLog.length > 0 ? (
            <ul className="space-y-2 text-sm font-mono">
              {operationLog.map((log, idx) => (
                <li 
                  key={idx} 
                  className={`${
                    log.includes('Error') 
                      ? 'text-destructive' 
                      : log.includes('swapped') 
                        ? 'text-warning' 
                        : log.includes('already') 
                          ? 'text-success' 
                          : 'text-foreground'
                  }`}
                >
                  [{idx + 1}] {log}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No operations yet. Request a page to see the log.
            </p>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div className="sim-panel bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-2">💡 How Demand Paging Works</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Pages are only loaded when accessed (lazy loading)</li>
          <li>Reduces initial memory usage and load time</li>
          <li>When RAM is full, a page must be evicted (page replacement)</li>
          <li>The evicted page is written back to disk if modified</li>
        </ul>
      </div>
    </div>
  );
};

export default DemandPagingTab;

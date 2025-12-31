/**
 * Page Replacement Algorithm Implementations
 * 
 * This file contains the core logic for three classic page replacement algorithms:
 * - FIFO (First In, First Out)
 * - LRU (Least Recently Used)
 * - Optimal (Bélády's Algorithm)
 * 
 * Each algorithm simulates how an operating system decides which page to remove
 * from memory when a new page needs to be loaded and all frames are full.
 */

import { ExecutionStep } from './types';

/**
 * Parses a comma-separated string of page references into an array of numbers
 * Example: "7,0,1,2" -> [7, 0, 1, 2]
 */
export const parseReferenceString = (str: string): number[] => {
  return str
    .split(',')
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n));
};

/**
 * FIFO (First In, First Out) Page Replacement Algorithm
 * 
 * How it works:
 * - Pages are replaced in the order they were loaded into memory
 * - The oldest page (first one loaded) is always replaced first
 * - Uses a queue to track the order pages were loaded
 * 
 * Pros: Simple to implement
 * Cons: May remove frequently used pages (Bélády's Anomaly possible)
 */
export const simulateFIFO = (references: number[], frames: number[]) => {
  const steps: ExecutionStep[] = [];
  const memory: number[] = [];
  let faults = 0;
  let hits = 0;
  const queue: number[] = []; // Tracks order pages were loaded

  references.forEach((page, idx) => {
    const pageIdx = memory.findIndex(f => f === page);
    let status: 'hit' | 'fault' = 'fault';
    let replaced: number | null = null;

    if (pageIdx !== -1) {
      // Page already in memory - HIT!
      status = 'hit';
      hits++;
    } else {
      // Page not in memory - FAULT!
      faults++;
      if (memory.length < frames.length) {
        // Empty frame available, just load the page
        memory.push(page);
        queue.push(page);
      } else {
        // Memory full, need to replace oldest page
        replaced = queue.shift()!; // Remove oldest from queue
        const replaceIdx = memory.indexOf(replaced);
        memory[replaceIdx] = page;
        queue.push(page);
      }
    }

    steps.push({
      step: idx + 1,
      page,
      frames: [...memory],
      status,
      replaced,
      faults,
      hits,
      explanation: status === 'hit' 
        ? `Page ${page} is already in memory - HIT!`
        : replaced 
          ? `Page ${page} caused a fault. Removed page ${replaced} (oldest) using FIFO.`
          : `Page ${page} loaded into empty frame - FAULT.`
    });
  });

  return { steps, faults, hits };
};

/**
 * LRU (Least Recently Used) Page Replacement Algorithm
 * 
 * How it works:
 * - Replaces the page that hasn't been used for the longest time
 * - Tracks when each page was last accessed
 * - The page with the oldest "last used" timestamp is replaced
 * 
 * Pros: Good approximation of optimal, no Bélády's Anomaly
 * Cons: Requires tracking access times (overhead)
 */
export const simulateLRU = (references: number[], frames: number[]) => {
  const steps: ExecutionStep[] = [];
  const memory: number[] = [];
  let faults = 0;
  let hits = 0;
  const lastUsed: Record<number, number> = {}; // Maps page -> last access time

  references.forEach((page, idx) => {
    const pageIdx = memory.findIndex(f => f === page);
    let status: 'hit' | 'fault' = 'fault';
    let replaced: number | null = null;

    if (pageIdx !== -1) {
      // Page found in memory - HIT!
      status = 'hit';
      hits++;
      lastUsed[page] = idx; // Update last access time
    } else {
      // Page not in memory - FAULT!
      faults++;
      if (memory.length < frames.length) {
        // Empty frame available
        memory.push(page);
      } else {
        // Find the least recently used page
        let lruPage = memory[0];
        let lruTime = lastUsed[lruPage] ?? -1;
        
        memory.forEach(p => {
          const time = lastUsed[p] ?? -1;
          if (time < lruTime) {
            lruTime = time;
            lruPage = p;
          }
        });
        
        replaced = lruPage;
        const replaceIdx = memory.indexOf(lruPage);
        memory[replaceIdx] = page;
      }
      lastUsed[page] = idx;
    }

    steps.push({
      step: idx + 1,
      page,
      frames: [...memory],
      status,
      replaced,
      faults,
      hits,
      explanation: status === 'hit'
        ? `Page ${page} is already in memory - HIT!`
        : replaced
          ? `Page ${page} caused a fault. Removed page ${replaced} (least recently used) using LRU.`
          : `Page ${page} loaded into empty frame - FAULT.`
    });
  });

  return { steps, faults, hits };
};

/**
 * Optimal (Bélády's) Page Replacement Algorithm
 * 
 * How it works:
 * - Replaces the page that won't be used for the longest time in the future
 * - Requires knowledge of future page references (theoretical)
 * - Provides the minimum possible page faults (benchmark for other algorithms)
 * 
 * Pros: Optimal performance, minimum page faults
 * Cons: Requires future knowledge (not implementable in practice)
 */
export const simulateOptimal = (references: number[], frames: number[]) => {
  const steps: ExecutionStep[] = [];
  const memory: number[] = [];
  let faults = 0;
  let hits = 0;

  references.forEach((page, idx) => {
    const pageIdx = memory.findIndex(f => f === page);
    let status: 'hit' | 'fault' = 'fault';
    let replaced: number | null = null;

    if (pageIdx !== -1) {
      // Page found in memory - HIT!
      status = 'hit';
      hits++;
    } else {
      // Page not in memory - FAULT!
      faults++;
      if (memory.length < frames.length) {
        // Empty frame available
        memory.push(page);
      } else {
        // Find the page used farthest in the future
        let farthest = -1;
        let replaceIdx = 0;

        memory.forEach((p, i) => {
          // Find when this page will be used next
          let nextUse = references.slice(idx + 1).indexOf(p);
          if (nextUse === -1) nextUse = Infinity; // Never used again
          if (nextUse > farthest) {
            farthest = nextUse;
            replaceIdx = i;
          }
        });

        replaced = memory[replaceIdx];
        memory[replaceIdx] = page;
      }
    }

    steps.push({
      step: idx + 1,
      page,
      frames: [...memory],
      status,
      replaced,
      faults,
      hits,
      explanation: status === 'hit'
        ? `Page ${page} is already in memory - HIT!`
        : replaced
          ? `Page ${page} caused a fault. Removed page ${replaced} (used farthest in future) using Optimal.`
          : `Page ${page} loaded into empty frame - FAULT.`
    });
  });

  return { steps, faults, hits };
};

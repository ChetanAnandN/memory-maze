/**
 * Type definitions for the Virtual Memory Simulator
 * These types help ensure type safety across all simulator components
 */

// Represents a single step in the page replacement simulation
export interface ExecutionStep {
  step: number;           // Step number in the sequence
  page: number;           // Page being accessed
  frames: number[];       // Current state of memory frames
  status: 'hit' | 'fault'; // Whether this access was a hit or fault
  replaced: number | null; // Page that was replaced (if any)
  faults: number;         // Cumulative fault count
  hits: number;           // Cumulative hit count
  explanation: string;    // Human-readable explanation of what happened
}

// Page table entry for address translation
export interface PageTableEntry {
  page: number;           // Page number
  frame: number;          // Frame number in physical memory
  valid: boolean;         // Valid/invalid bit
}

// Result of address translation
export interface TranslationResult {
  logicalAddress: number;
  pageNumber: number;
  offset: number;
  frameNumber: number | string;
  physicalAddress: number | string;
}

// TLB (Translation Lookaside Buffer) cache entry
export interface TLBEntry {
  page: number;
  frame: number;
}

// Thrashing simulation data point
export interface ThrashingDataPoint {
  time: number;
  faultRate: number;
  cpuUtil: number;
}

// Algorithm comparison results
export interface ComparisonData {
  FIFO: { faults: number; hits: number };
  LRU: { faults: number; hits: number };
  Optimal: { faults: number; hits: number };
}

// Chart data for performance visualization
export interface ChartDataPoint {
  step: number;
  faults: number;
  hits: number;
}

// Tab configuration
export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

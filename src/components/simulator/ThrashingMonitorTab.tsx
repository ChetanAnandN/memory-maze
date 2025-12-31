/**
 * Thrashing Monitor Tab Component
 * 
 * This tab demonstrates thrashing - a condition where the system spends
 * more time swapping pages than executing useful work.
 * 
 * Key concepts:
 * - Thrashing occurs when processes don't have enough frames
 * - Working set: minimum pages a process needs in memory
 * - When frames < working set, page faults increase dramatically
 * - High page fault rate → low CPU utilization
 */

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThrashingDataPoint } from './types';

interface ThrashingMonitorTabProps {
  darkMode: boolean;
}

const ThrashingMonitorTab: React.FC<ThrashingMonitorTabProps> = ({ darkMode }) => {
  // Configuration
  const [processes, setProcesses] = useState(4);
  const [totalFrames, setTotalFrames] = useState(8);
  const [workingSet, setWorkingSet] = useState(3);

  // Simulation results
  const [thrashingData, setThrashingData] = useState<ThrashingDataPoint[]>([]);
  const [faultRate, setFaultRate] = useState(0);
  const [cpuUtil, setCpuUtil] = useState(100);
  const [thrashingStatus, setThrashingStatus] = useState<'NORMAL' | 'WARNING' | 'THRASHING'>('NORMAL');

  /**
   * Simulates system behavior based on memory allocation
   * 
   * The simulation models:
   * - If frames per process < working set → high fault rate, low CPU
   * - If frames per process ≥ working set → low fault rate, high CPU
   */
  const runThrashingSimulation = () => {
    const data: ThrashingDataPoint[] = [];
    const framesPerProcess = totalFrames / processes;
    
    // Generate 20 time points
    for (let i = 1; i <= 20; i++) {
      let faultRateVal: number;
      let cpuUtilVal: number;
      
      if (framesPerProcess < workingSet) {
        // THRASHING: Not enough frames for working set
        // Page fault rate increases, CPU utilization drops
        faultRateVal = Math.min(95, 30 + (workingSet - framesPerProcess) * 20 + Math.random() * 10);
        cpuUtilVal = Math.max(5, 100 - faultRateVal - Math.random() * 10);
      } else {
        // NORMAL: Adequate frames for working set
        // Low page faults, high CPU utilization
        faultRateVal = Math.max(5, 15 - (framesPerProcess - workingSet) * 3 + Math.random() * 5);
        cpuUtilVal = Math.min(95, 85 + Math.random() * 10);
      }
      
      data.push({
        time: i,
        faultRate: parseFloat(faultRateVal.toFixed(2)),
        cpuUtil: parseFloat(cpuUtilVal.toFixed(2))
      });
    }
    
    setThrashingData(data);
    
    // Calculate averages for status display
    const avgFaultRate = data.reduce((sum, d) => sum + d.faultRate, 0) / data.length;
    const avgCpuUtil = data.reduce((sum, d) => sum + d.cpuUtil, 0) / data.length;
    
    setFaultRate(avgFaultRate);
    setCpuUtil(avgCpuUtil);
    
    // Determine status based on fault rate
    if (avgFaultRate > 60) {
      setThrashingStatus('THRASHING');
    } else if (avgFaultRate > 35) {
      setThrashingStatus('WARNING');
    } else {
      setThrashingStatus('NORMAL');
    }
  };

  // Calculate frames per process for display
  const framesPerProcess = (totalFrames / processes).toFixed(2);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="sim-stat-card">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Average Page Fault Rate
          </div>
          <div className={`text-4xl font-bold ${
            faultRate > 60 ? 'text-destructive' : 
            faultRate > 35 ? 'text-warning' : 'text-success'
          }`}>
            {faultRate.toFixed(1)}%
          </div>
        </div>
        
        <div className="sim-stat-card">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            CPU Utilization
          </div>
          <div className="text-4xl font-bold text-primary">
            {cpuUtil.toFixed(1)}%
          </div>
        </div>
        
        <div className="sim-stat-card">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            System Status
          </div>
          <div className={`text-2xl font-bold flex items-center gap-2 ${
            thrashingStatus === 'THRASHING' ? 'text-destructive' : 
            thrashingStatus === 'WARNING' ? 'text-warning' : 'text-success'
          }`}>
            <span className="animate-pulse">●</span>
            {thrashingStatus}
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="sim-panel">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="text-warning" size={24} />
          Simulation Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Processes
            </label>
            <Input
              type="number"
              value={processes}
              onChange={(e) => setProcesses(parseInt(e.target.value) || 1)}
              min={1}
              max={20}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Active processes competing for memory
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Total Memory Frames
            </label>
            <Input
              type="number"
              value={totalFrames}
              onChange={(e) => setTotalFrames(parseInt(e.target.value) || 1)}
              min={1}
              max={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available physical memory frames
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Working Set Size
            </label>
            <Input
              type="number"
              value={workingSet}
              onChange={(e) => setWorkingSet(parseInt(e.target.value) || 1)}
              min={1}
              max={20}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pages each process needs to run efficiently
            </p>
          </div>
        </div>

        {/* Analysis Preview */}
        <div className="p-4 rounded-lg bg-muted/30 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Frames per process: </span>
              <span className="font-semibold">{framesPerProcess}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Required for efficiency: </span>
              <span className="font-semibold">{workingSet} frames</span>
            </div>
          </div>
          <p className={`mt-2 text-sm font-medium ${
            parseFloat(framesPerProcess) < workingSet 
              ? 'text-destructive' 
              : 'text-success'
          }`}>
            {parseFloat(framesPerProcess) < workingSet 
              ? '⚠ Insufficient frames - thrashing likely!'
              : '✓ Adequate frames - system should run smoothly'}
          </p>
        </div>
        
        <Button onClick={runThrashingSimulation}>
          Run Simulation
        </Button>
      </div>

      {/* Results Chart */}
      {thrashingData.length > 0 && (
        <div className="sim-panel animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">System Performance Over Time</h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={thrashingData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? 'hsl(217 33% 25%)' : 'hsl(214 32% 91%)'} 
              />
              <XAxis 
                dataKey="time" 
                stroke={darkMode ? 'hsl(215 20% 65%)' : 'hsl(215 16% 47%)'} 
                label={{ value: 'Time', position: 'bottom' }}
              />
              <YAxis 
                stroke={darkMode ? 'hsl(215 20% 65%)' : 'hsl(215 16% 47%)'} 
                label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? 'hsl(222 47% 9%)' : 'hsl(0 0% 100%)',
                  border: `1px solid ${darkMode ? 'hsl(217 33% 17%)' : 'hsl(214 32% 91%)'}`
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="faultRate" 
                stackId="1" 
                stroke="hsl(0 84% 60%)" 
                fill="hsl(0 84% 60%)" 
                fillOpacity={0.6} 
                name="Page Fault Rate %" 
              />
              <Area 
                type="monotone" 
                dataKey="cpuUtil" 
                stackId="2" 
                stroke="hsl(142 76% 36%)" 
                fill="hsl(142 76% 36%)" 
                fillOpacity={0.6} 
                name="CPU Utilization %" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Explanation */}
      <div className="sim-panel bg-warning/5 border-warning/20">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle className="text-warning" size={18} />
          Understanding Thrashing
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>
            <strong>Cause:</strong> Too many processes competing for limited memory frames
          </li>
          <li>
            <strong>Effect:</strong> System spends most time swapping pages, little time doing useful work
          </li>
          <li>
            <strong>Solution:</strong> Reduce degree of multiprogramming or add more RAM
          </li>
          <li>
            <strong>Working Set Model:</strong> Keep each process's working set in memory to prevent thrashing
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ThrashingMonitorTab;

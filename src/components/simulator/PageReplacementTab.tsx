/**
 * Page Replacement Tab Component
 * 
 * This tab demonstrates page replacement algorithms (FIFO, LRU, Optimal).
 * Users can configure the simulation, watch it step-by-step, and compare algorithms.
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExecutionStep, ComparisonData, ChartDataPoint } from './types';
import { parseReferenceString, simulateFIFO, simulateLRU, simulateOptimal } from './algorithms';

interface PageReplacementTabProps {
  darkMode: boolean;
}

const PageReplacementTab: React.FC<PageReplacementTabProps> = ({ darkMode }) => {
  // Configuration state
  const [algorithm, setAlgorithm] = useState('FIFO');
  const [referenceString, setReferenceString] = useState('7,0,1,2,0,3,0,4,2,3,0,3,2');
  const [frameCount, setFrameCount] = useState(3);

  // Simulation state
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [executionData, setExecutionData] = useState<ExecutionStep[]>([]);

  // Comparison state
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  /**
   * Runs the simulation with the selected algorithm
   */
  const runSimulation = () => {
    const refs = parseReferenceString(referenceString);
    const frames = Array(frameCount).fill(null);
    let result;

    switch(algorithm) {
      case 'FIFO':
        result = simulateFIFO(refs, frames);
        break;
      case 'LRU':
        result = simulateLRU(refs, frames);
        break;
      case 'Optimal':
        result = simulateOptimal(refs, frames);
        break;
      default:
        result = simulateFIFO(refs, frames);
    }

    setExecutionData(result.steps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  /**
   * Compares all three algorithms with current settings
   */
  const runComparison = () => {
    const refs = parseReferenceString(referenceString);
    const frames = Array(frameCount).fill(null);
    
    const fifo = simulateFIFO(refs, frames);
    const lru = simulateLRU(refs, frames);
    const optimal = simulateOptimal(refs, frames);

    setComparisonData({
      FIFO: { faults: fifo.faults, hits: fifo.hits },
      LRU: { faults: lru.faults, hits: lru.hits },
      Optimal: { faults: optimal.faults, hits: optimal.hits }
    });
    setShowComparison(true);
  };

  // Auto-play effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < executionData.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000);
    } else if (currentStep >= executionData.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, executionData.length]);

  // Current step data with proper typing
  const currentData: ExecutionStep | null = executionData[currentStep] || null;
  const hitRatio = currentStep >= 0 && currentData
    ? ((currentData.hits || 0) / (currentStep + 1) * 100).toFixed(2)
    : '0';
  const missRatio = (100 - parseFloat(hitRatio)).toFixed(2);
  const isThrashing = parseFloat(missRatio) > 70;

  // Chart data
  const chartData: ChartDataPoint[] = executionData.slice(0, currentStep + 1).map(d => ({
    step: d.step,
    faults: d.faults,
    hits: d.hits
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Configuration Panel */}
      <div className="sim-panel">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Algorithm selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Algorithm</label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIFO">FIFO (First In, First Out)</SelectItem>
                <SelectItem value="LRU">LRU (Least Recently Used)</SelectItem>
                <SelectItem value="Optimal">Optimal (Bélády's)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frame count input */}
          <div>
            <label className="block text-sm font-medium mb-2">Number of Frames</label>
            <Input
              type="number"
              value={frameCount}
              onChange={(e) => setFrameCount(parseInt(e.target.value) || 3)}
              min={1}
              max={10}
            />
          </div>

          {/* Reference string input */}
          <div>
            <label className="block text-sm font-medium mb-2">Reference String</label>
            <Input
              type="text"
              value={referenceString}
              onChange={(e) => setReferenceString(e.target.value)}
              placeholder="e.g., 7,0,1,2,0,3"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <Button onClick={runSimulation}>
            Run Simulation
          </Button>
          <Button variant="secondary" onClick={runComparison}>
            Compare All Algorithms
          </Button>
        </div>
      </div>

      {/* Simulation Controls & Results */}
      {executionData.length > 0 && (
        <>
          {/* Playback Controls */}
          <div className="sim-panel">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-success hover:bg-success/90"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => setCurrentStep(prev => Math.min(prev + 1, executionData.length - 1))}
                  disabled={currentStep >= executionData.length - 1}
                >
                  <SkipForward size={20} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
                  className="bg-warning hover:bg-warning/90 text-warning-foreground"
                >
                  <RotateCcw size={20} />
                </Button>
              </div>
              <div className="text-lg font-semibold">
                Step: {currentStep + 1} / {executionData.length}
              </div>
            </div>
          </div>

          {/* Current Step Explanation */}
          {currentData && (
            <div className="sim-panel">
              <div className="flex items-start gap-3">
                <Info 
                  className={`mt-1 ${currentData.status === 'hit' ? 'text-success' : 'text-destructive'}`} 
                  size={24} 
                />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Current Page: <span className="text-primary">{currentData.page}</span> - 
                    <span className={`ml-2 ${currentData.status === 'hit' ? 'text-success' : 'text-destructive'}`}>
                      {currentData.status?.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-muted-foreground">
                    {currentData.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Memory Frames Visualization */}
          <div className="sim-panel">
            <h2 className="text-xl font-semibold mb-4">Memory Frames</h2>
            <div className="grid grid-cols-1 gap-3">
              {Array.from({ length: frameCount }).map((_, idx) => {
                const frameValue = currentData?.frames?.[idx];
                const isCurrentPage = currentData && frameValue === currentData.page;
                
                let frameClass = 'sim-frame ';
                if (frameValue !== undefined) {
                  if (isCurrentPage) {
                    frameClass += currentData?.status === 'hit' ? 'sim-frame-hit' : 'sim-frame-fault';
                  } else {
                    frameClass += 'sim-frame-filled';
                  }
                } else {
                  frameClass += 'sim-frame-empty';
                }

                return (
                  <div key={idx} className={frameClass}>
                    <span className="text-xs text-muted-foreground block mb-1">Frame {idx}</span>
                    {frameValue !== undefined ? frameValue : '—'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sim-stat-card">
              <div className="text-sm font-medium text-muted-foreground">Page Faults</div>
              <div className="text-3xl font-bold text-destructive mt-2">{currentData?.faults || 0}</div>
            </div>
            <div className="sim-stat-card">
              <div className="text-sm font-medium text-muted-foreground">Page Hits</div>
              <div className="text-3xl font-bold text-success mt-2">{currentData?.hits || 0}</div>
            </div>
            <div className="sim-stat-card">
              <div className="text-sm font-medium text-muted-foreground">Hit Ratio</div>
              <div className="text-3xl font-bold text-primary mt-2">{hitRatio}%</div>
            </div>
            <div className="sim-stat-card">
              <div className="text-sm font-medium text-muted-foreground">Miss Ratio</div>
              <div className={`text-3xl font-bold mt-2 ${isThrashing ? 'text-destructive' : 'text-warning'}`}>
                {missRatio}%
                {isThrashing && <span className="text-xs block mt-1">⚠ Thrashing Risk</span>}
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="sim-panel">
            <h2 className="text-xl font-semibold mb-4">Performance Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={darkMode ? 'hsl(217 33% 25%)' : 'hsl(214 32% 91%)'} 
                />
                <XAxis 
                  dataKey="step" 
                  stroke={darkMode ? 'hsl(215 20% 65%)' : 'hsl(215 16% 47%)'} 
                />
                <YAxis 
                  stroke={darkMode ? 'hsl(215 20% 65%)' : 'hsl(215 16% 47%)'} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? 'hsl(222 47% 9%)' : 'hsl(0 0% 100%)',
                    border: `1px solid ${darkMode ? 'hsl(217 33% 17%)' : 'hsl(214 32% 91%)'}`
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="faults" 
                  stroke="hsl(0 84% 60%)" 
                  strokeWidth={2} 
                  name="Page Faults" 
                />
                <Line 
                  type="monotone" 
                  dataKey="hits" 
                  stroke="hsl(142 76% 36%)" 
                  strokeWidth={2} 
                  name="Page Hits" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Algorithm Comparison */}
      {showComparison && comparisonData && (
        <div className="sim-panel animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Algorithm Comparison</h2>
            <Button variant="secondary" size="sm" onClick={() => setShowComparison(false)}>
              Close
            </Button>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'FIFO', Faults: comparisonData.FIFO.faults, Hits: comparisonData.FIFO.hits },
              { name: 'LRU', Faults: comparisonData.LRU.faults, Hits: comparisonData.LRU.hits },
              { name: 'Optimal', Faults: comparisonData.Optimal.faults, Hits: comparisonData.Optimal.hits }
            ]}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? 'hsl(217 33% 25%)' : 'hsl(214 32% 91%)'} 
              />
              <XAxis 
                dataKey="name" 
                stroke={darkMode ? 'hsl(215 20% 65%)' : 'hsl(215 16% 47%)'} 
              />
              <YAxis 
                stroke={darkMode ? 'hsl(215 20% 65%)' : 'hsl(215 16% 47%)'} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? 'hsl(222 47% 9%)' : 'hsl(0 0% 100%)',
                  border: `1px solid ${darkMode ? 'hsl(217 33% 17%)' : 'hsl(214 32% 91%)'}`
                }}
              />
              <Legend />
              <Bar dataKey="Faults" fill="hsl(0 84% 60%)" />
              <Bar dataKey="Hits" fill="hsl(142 76% 36%)" />
            </BarChart>
          </ResponsiveContainer>

          {/* Comparison Summary */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {Object.entries(comparisonData).map(([algo, data]) => (
              <div key={algo} className="p-4 rounded-lg bg-secondary">
                <h3 className="font-semibold mb-2">{algo}</h3>
                <div className="text-sm space-y-1">
                  <div>Faults: <span className="font-bold text-destructive">{data.faults}</span></div>
                  <div>Hits: <span className="font-bold text-success">{data.hits}</span></div>
                  <div>Hit Ratio: <span className="font-bold text-primary">
                    {((data.hits / (data.hits + data.faults)) * 100).toFixed(2)}%
                  </span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageReplacementTab;

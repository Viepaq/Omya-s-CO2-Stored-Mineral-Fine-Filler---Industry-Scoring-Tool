import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  ReferenceLine,
  Text
} from 'recharts';
import { ChevronRight, RefreshCcw, Info, CheckCircle2, Hexagon } from 'lucide-react';

/**
 * CONFIGURATION & DATA
 */
const QUESTIONS = {
  frictionToAdopt: [
    { 
      id: 'f1', 
      text: 'Colour / ΔE tolerance',
      minLabel: 'Very strict white',
      maxLabel: 'Natural grey acceptable',
      weight: 1
    },
    { 
      id: 'f2', 
      text: 'Purity effect',
      minLabel: 'High concern',
      maxLabel: 'Low concern',
      weight: 1
    },
    { 
      id: 'f3', 
      text: 'Number or complication of jobs',
      minLabel: 'Major changes',
      maxLabel: 'Drop-in',
      weight: 1
    },
    { 
      id: 'f4', 
      text: 'Packaging',
      minLabel: 'High concern',
      maxLabel: 'Low concern',
      weight: 1
    },
    { 
      id: 'f5', 
      text: 'Volume',
      minLabel: 'No interest',
      maxLabel: 'High',
      weight: 1
    },
    // Extended Factors (Half Weight)
    { 
      id: 'f6', 
      text: 'Particle size fit',
      minLabel: 'Outside range',
      maxLabel: 'Within target',
      weight: 0.5
    },
    { 
      id: 'f7', 
      text: 'Recyclability concerns',
      minLabel: 'Severe',
      maxLabel: 'None',
      weight: 0.5
    },
    { 
      id: 'f8', 
      text: 'Locked-in to "original parts" / supplier',
      minLabel: 'Tight lock-in',
      maxLabel: 'Flexible',
      weight: 0.5
    },
    { 
      id: 'f9', 
      text: 'Different filler supplier already fixed',
      minLabel: 'Fixed',
      maxLabel: 'Not fixed',
      weight: 0.5
    },
    { 
      id: 'f10', 
      text: 'Filler spread across value chain',
      minLabel: 'Tiny niche',
      maxLabel: 'Used widely',
      weight: 0.5
    },
  ],
  priceSensitivity: [
    { 
      id: 'p1', 
      text: 'Willingness to pay',
      minLabel: 'None',
      maxLabel: '>12% premium',
      weight: 1
    },
    { 
      id: 'p2', 
      text: 'Performance parity',
      minLabel: 'Inferior',
      maxLabel: 'Equal/better',
      weight: 1
    },
    { 
      id: 'p3', 
      text: 'Tax / other incentives',
      minLabel: 'None',
      maxLabel: 'Strong',
      weight: 1
    },
    { 
      id: 'p4', 
      text: 'First-mover reluctance',
      minLabel: 'Will not pilot first',
      maxLabel: 'Happy to pilot',
      weight: 1
    },
    { 
      id: 'p5', 
      text: 'Stated need',
      minLabel: 'No need',
      maxLabel: 'Clear need',
      weight: 1
    },
    // Extended Factors (Half Weight)
    { 
      id: 'p6', 
      text: 'Risk of losing market share due to price',
      minLabel: 'High risk',
      maxLabel: 'Low risk',
      weight: 0.5
    },
    { 
      id: 'p7', 
      text: 'CO2 certificates cheaper than switching',
      minLabel: 'Yes',
      maxLabel: 'No',
      weight: 0.5
    },
  ],
};

// Updated Colors for Dark Theme
const RATING_OPTIONS = [
  { label: '--', value: -2, color: 'bg-zinc-800 text-zinc-500 border-zinc-700', activeColor: 'bg-red-500/20 text-red-500 border-red-500 glow-orange' },
  { label: '-', value: -1, color: 'bg-zinc-800 text-zinc-500 border-zinc-700', activeColor: 'bg-orange-500/20 text-orange-500 border-orange-500 glow-orange' },
  { label: '0', value: 0, color: 'bg-zinc-800 text-zinc-500 border-zinc-700', activeColor: 'bg-zinc-600 text-white border-zinc-500' },
  { label: '+', value: 1, color: 'bg-zinc-800 text-zinc-500 border-zinc-700', activeColor: 'bg-emerald-500/20 text-emerald-500 border-emerald-500 glow-orange' },
  { label: '++', value: 2, color: 'bg-zinc-800 text-zinc-500 border-zinc-700', activeColor: 'bg-blue-500/20 text-blue-500 border-blue-500 glow-orange' },
];

/**
 * COMPONENT: RatingRow
 */
const RatingRow = ({ question, value, onChange }) => {
  return (
    <div className="mb-8 last:mb-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-baseline mb-3">
        <h3 className="text-sm font-medium text-zinc-200">
          {question.text}
          {question.weight === 0.5 && <span className="ml-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-800 px-1.5 py-0.5 rounded">0.5x</span>}
        </h3>
      </div>
      
      <div className="flex justify-between text-[10px] text-zinc-500 mb-2 px-1 font-medium uppercase tracking-wider">
        <span>{question.minLabel}</span>
        <span>{question.maxLabel}</span>
      </div>

      <div className="flex justify-between gap-2">
        {RATING_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.label}
              onClick={() => onChange(question.id, option.value)}
              className={`
                h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300
                border
                ${isSelected ? option.activeColor : option.color}
                ${isSelected ? 'scale-110 shadow-lg' : 'hover:scale-105 active:scale-95 hover:border-zinc-500 hover:text-zinc-300'}
              `}
              aria-label={`Rate ${option.label}`}
              aria-pressed={isSelected}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * COMPONENT: ChartTooltip
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-900/95 backdrop-blur-md p-3 border border-zinc-700 rounded-xl shadow-2xl text-xs">
        <p className="font-bold text-orange-500 mb-1">{data.name}</p>
        <div className="space-y-1">
          <p className="text-zinc-400 flex justify-between gap-4">
            <span>Friction:</span> <span className="text-zinc-200 font-mono">{data.x.toFixed(1)}</span>
          </p>
          <p className="text-zinc-400 flex justify-between gap-4">
            <span>Price Sens:</span> <span className="text-zinc-200 font-mono">{data.y.toFixed(1)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Custom Quadrant Labels Component
 */
const QuadrantLabel = ({ viewBox, value, x, y }) => {
  const { x: vx, y: vy, width, height } = viewBox;
  return (
    <Text 
      x={vx + width * x} 
      y={vy + height * y} 
      textAnchor="middle" 
      verticalAnchor="middle"
      fill="#52525b"
      className="text-xs font-bold uppercase tracking-widest opacity-40 pointer-events-none"
    >
      {value}
    </Text>
  );
};

/**
 * MAIN COMPONENT: App
 */
export default function App() {
  const [step, setStep] = useState('landing');
  const [industryName, setIndustryName] = useState('');
  const [scores, setScores] = useState({});

  const handleRatingChange = (id, value) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const handleStart = () => {
    if (industryName.trim()) setStep('assessment');
  };

  const handleReset = () => {
    setScores({});
    setIndustryName('');
    setStep('landing');
  };

  const isAssessmentComplete = useMemo(() => {
    const allQuestions = [...QUESTIONS.priceSensitivity, ...QUESTIONS.frictionToAdopt];
    return allQuestions.every(q => scores[q.id] !== undefined);
  }, [scores]);

  const results = useMemo(() => {
    if (step !== 'result') return null;
    
    // Calculate Weighted Scores
    const frictionScore = QUESTIONS.frictionToAdopt.reduce((acc, q) => acc + ((scores[q.id] || 0) * (q.weight || 1)), 0);
    const priceScore = QUESTIONS.priceSensitivity.reduce((acc, q) => acc + ((scores[q.id] || 0) * (q.weight || 1)), 0);
    
    const totalRawScore = frictionScore + priceScore;

    // Calculate Max Possible Score (considering weights)
    const maxFriction = QUESTIONS.frictionToAdopt.reduce((acc, q) => acc + (2 * (q.weight || 1)), 0);
    const maxPrice = QUESTIONS.priceSensitivity.reduce((acc, q) => acc + (2 * (q.weight || 1)), 0);
    const maxScore = maxFriction + maxPrice;

    return { x: frictionScore, y: priceScore, totalScore: totalRawScore, maxScore };
  }, [scores, step]);

  // --- RENDERERS ---

  const renderLanding = () => (
    <div className="flex flex-col h-full justify-center px-6 animate-in fade-in zoom-in-95 duration-700">
      <div className="mb-12 text-center space-y-6">
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
          <div className="relative h-24 w-24 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-3xl flex items-center justify-center shadow-2xl">
            <Hexagon className="text-orange-500 w-12 h-12" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white tracking-tight glow-text">
          Industry<br/>Scoring
        </h1>
        <p className="text-zinc-500 text-lg leading-relaxed max-w-xs mx-auto">
          Evaluate viability based on adoption friction & price sensitivity.
        </p>
      </div>

      <div className="space-y-6">
        <div className="group">
          <label htmlFor="industry" className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider ml-1">
            Industry / Company
          </label>
          <input
            id="industry"
            type="text"
            value={industryName}
            onChange={(e) => setIndustryName(e.target.value)}
            placeholder="e.g. Packaging"
            className="w-full px-6 py-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-white text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-zinc-700"
            autoFocus
          />
        </div>
        
        <button
          onClick={handleStart}
          disabled={!industryName.trim()}
          className="w-full py-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 hover:brightness-110"
        >
          Start Analysis <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderAssessment = () => {
    const totalQuestions = QUESTIONS.priceSensitivity.length + QUESTIONS.frictionToAdopt.length;
    const answeredCount = Object.keys(scores).length;

    return (
      <div className="px-4 pb-32 animate-in slide-in-from-right-8 duration-500">
        {/* Header */}
        <div className="py-6 sticky top-0 bg-zinc-950/90 backdrop-blur-xl z-20 border-b border-zinc-800 mb-8 -mx-4 px-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Assessment</p>
              <h2 className="text-xl font-bold text-white truncate max-w-[200px]">{industryName}</h2>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-2xl font-bold text-white font-mono">{answeredCount}<span className="text-zinc-600 text-lg">/{totalQuestions}</span></span>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
              <h3 className="text-xl font-bold text-white">Friction to Adopt</h3>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-[2rem] shadow-xl backdrop-blur-sm">
              {QUESTIONS.frictionToAdopt.map(q => (
                <RatingRow key={q.id} question={q} value={scores[q.id]} onChange={handleRatingChange} />
              ))}
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-zinc-600 rounded-full"></div>
              <h3 className="text-xl font-bold text-white">Price Sensitivity</h3>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-[2rem] shadow-xl backdrop-blur-sm">
              {QUESTIONS.priceSensitivity.map(q => (
                <RatingRow key={q.id} question={q} value={scores[q.id]} onChange={handleRatingChange} />
              ))}
            </div>
          </section>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 left-4 right-4 z-30">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setStep('result')}
              disabled={!isAssessmentComplete}
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-900/40 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 backdrop-blur-md"
            >
              {isAssessmentComplete ? 'Show Results' : 'Complete All Items'} 
              {isAssessmentComplete && <CheckCircle2 size={20} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!results) return null;
    const chartData = [{ x: results.x, y: results.y, name: industryName, z: 1 }];
    const isOpportunity = results.x > 0 && results.y > 0;

    return (
      <div className="flex flex-col h-full px-4 pb-8 animate-in zoom-in-95 duration-700">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pt-2">
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Result</p>
            <h2 className="text-3xl font-bold text-white tracking-tight">{industryName}</h2>
          </div>
          <button onClick={handleReset} className="p-3 bg-zinc-900 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors border border-zinc-800">
            <RefreshCcw size={20} />
          </button>
        </div>

        {/* Total Score Card */}
         <div className="mb-6 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-center shadow-lg shadow-orange-900/20">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
            
            <p className="relative text-xs font-bold text-orange-100 uppercase tracking-widest mb-2 opacity-80">Total Score</p>
            <div className="relative flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-white tracking-tighter">{results.totalScore.toFixed(1)}</span>
              <span className="text-xl font-medium text-orange-200">/{results.maxScore.toFixed(1)}</span>
            </div>
        </div>

        {/* Chart Container */}
        <div className="bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 p-2 mb-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-6 left-6 z-10">
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Analysis Map</span>
          </div>
          
          <div className="h-[380px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Friction" 
                  domain={[-10, 10]} 
                  tickCount={5}
                  stroke="#52525b"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Friction to Adopt', position: 'bottom', offset: 0, fontSize: 10, fill: '#71717a', textAnchor: 'middle' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Price Sensitivity" 
                  domain={[-10, 10]} 
                  tickCount={5}
                  stroke="#52525b"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Price Sensitivity', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#71717a' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#52525b' }} />
                
                {/* Quadrant Lines */}
                <ReferenceLine x={0} stroke="#3f3f46" strokeWidth={1} />
                <ReferenceLine y={0} stroke="#3f3f46" strokeWidth={1} />
                
                {/* Quadrant Labels */}
                <ReferenceLine x={5} y={5} stroke="none" label={<QuadrantLabel value="Opportunity" x={0.5} y={0.15} />} />
                <ReferenceLine x={-5} y={5} stroke="none" label={<QuadrantLabel value="Challenging" x={0.5} y={0.15} />} />
                <ReferenceLine x={-5} y={-5} stroke="none" label={<QuadrantLabel value="Challenging" x={0.5} y={0.85} />} />
                <ReferenceLine x={5} y={-5} stroke="none" label={<QuadrantLabel value="Challenging" x={0.5} y={0.85} />} />

                <Scatter name={industryName} data={chartData} fill="#f97316">
                  <Cell fill="#f97316" />
                </Scatter>

                 <Text 
                    x={results.x}
                 />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insight Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${isOpportunity ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-400'}`}>
              <Info size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg mb-2">
                 {isOpportunity ? 'Opportunity Zone' : 'Challenging Territory'}
              </h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                 {isOpportunity 
                    ? 'This industry shows positive indicators for both adoption readiness and pricing flexibility. High potential for market entry.'
                    : 'This market faces significant hurdles. Requires either a strategic pivot or accepted long-term investment cycles.'
                  }
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 text-center">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Friction</p>
            <p className={`text-3xl font-bold font-mono ${results.x > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {results.x > 0 ? '+' : ''}{results.x.toFixed(1)}
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 text-center">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Price Sens.</p>
            <p className={`text-3xl font-bold font-mono ${results.y > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
               {results.y > 0 ? '+' : ''}{results.y.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black font-sans text-zinc-100 selection:bg-orange-500/30">
      <div className="max-w-md mx-auto min-h-screen bg-zinc-950 shadow-2xl relative border-x border-zinc-900 pt-12">
        {step === 'landing' && renderLanding()}
        {step === 'assessment' && renderAssessment()}
        {step === 'result' && renderResult()}
      </div>
    </div>
  );
}

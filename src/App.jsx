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
  Label
} from 'recharts';
import { ChevronRight, RefreshCcw, Info, BarChart3, CheckCircle2 } from 'lucide-react';

/**
 * CONFIGURATION & DATA
 * Defining the questions and categories.
 */
const QUESTIONS = {
  priceSensitivity: [
    { id: 'p1', text: 'Initial Investment Cost' },
    { id: 'p2', text: 'Ongoing Operating Cost' },
    { id: 'p3', text: 'Perception of ROI' },
    { id: 'p4', text: 'Competitive Pricing Pressure' },
    { id: 'p5', text: 'Budget Availability' },
  ],
  frictionToAdopt: [
    { id: 'f1', text: 'Integration Complexity' },
    { id: 'f2', text: 'Training & Skill Requirements' },
    { id: 'f3', text: 'Resistance from Legacy Systems' },
    { id: 'f4', text: 'Technical Prerequisite Load' },
    { id: 'f5', text: 'Process Change Management' },
  ]
};

const RATING_OPTIONS = [
  { label: '--', value: -2, color: 'bg-rose-100 text-rose-700 border-rose-200', activeColor: 'bg-rose-500 text-white border-rose-600' },
  { label: '-', value: -1, color: 'bg-orange-50 text-orange-700 border-orange-200', activeColor: 'bg-orange-500 text-white border-orange-600' },
  { label: '0', value: 0, color: 'bg-slate-50 text-slate-600 border-slate-200', activeColor: 'bg-slate-500 text-white border-slate-600' },
  { label: '+', value: 1, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', activeColor: 'bg-emerald-500 text-white border-emerald-600' },
  { label: '++', value: 2, color: 'bg-blue-50 text-blue-700 border-blue-200', activeColor: 'bg-blue-600 text-white border-blue-700' },
];

/**
 * COMPONENT: RatingRow
 * A specialized accessible input for the 5-point scale.
 */
const RatingRow = ({ question, value, onChange }) => {
  return (
    <div className="mb-8 last:mb-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-sm font-medium text-slate-700 mb-3 ml-1">{question.text}</h3>
      <div className="flex justify-between gap-2">
        {RATING_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.label}
              onClick={() => onChange(question.id, option.value)}
              className={`
                h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 shadow-sm
                border
                ${isSelected ? option.activeColor : option.color}
                ${isSelected ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-slate-100' : 'hover:scale-105 active:scale-95'}
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
 * Custom tooltip for the Recharts component
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur-sm p-3 border border-slate-200 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-slate-800">{data.name}</p>
        <p className="text-slate-600">Friction: {data.x}</p>
        <p className="text-slate-600">Price Sens: {data.y}</p>
      </div>
    );
  }
  return null;
};

/**
 * MAIN COMPONENT: App
 */
export default function App() {
  // State
  const [step, setStep] = useState('landing'); // landing | assessment | result
  const [industryName, setIndustryName] = useState('');
  const [scores, setScores] = useState({});

  // Handlers
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

  // Calculations
  const isAssessmentComplete = useMemo(() => {
    const totalQuestions = QUESTIONS.priceSensitivity.length + QUESTIONS.frictionToAdopt.length;
    return Object.keys(scores).length === totalQuestions;
  }, [scores]);

  const results = useMemo(() => {
    if (step !== 'result') return null;

    // Y-Axis: Price Sensitivity (Category A)
    const scoreA = QUESTIONS.priceSensitivity.reduce((acc, q) => acc + (scores[q.id] || 0), 0);
    
    // X-Axis: Friction to Adopt (Category B)
    const scoreB = QUESTIONS.frictionToAdopt.reduce((acc, q) => acc + (scores[q.id] || 0), 0);

    return { x: scoreB, y: scoreA };
  }, [scores, step]);

  // Render Helpers
  const renderLanding = () => (
    <div className="flex flex-col h-full justify-center px-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8 text-center space-y-4">
        <div className="h-20 w-20 bg-indigo-600 rounded-3xl mx-auto shadow-xl flex items-center justify-center mb-6">
          <BarChart3 className="text-white h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Market<br/>Scout</h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          Evaluate industry viability based on adoption friction and price sensitivity.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1 ml-1">
            Industry or Product Name
          </label>
          <input
            id="industry"
            type="text"
            value={industryName}
            onChange={(e) => setIndustryName(e.target.value)}
            placeholder="e.g. Enterprise VR Headsets"
            className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
            autoFocus
          />
        </div>
        
        <button
          onClick={handleStart}
          disabled={!industryName.trim()}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-indigo-700"
        >
          Start Assessment <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderAssessment = () => (
    <div className="px-4 pb-24 animate-in slide-in-from-right-8 duration-500">
      <div className="py-6 sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 border-b border-slate-200/50 mb-6">
        <div className="flex justify-between items-baseline">
          <h2 className="text-xl font-bold text-slate-900 truncate pr-4">{industryName}</h2>
          <span className="text-xs font-semibold px-2 py-1 bg-slate-200 text-slate-600 rounded-full">
            {Object.keys(scores).length} / 10
          </span>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="h-6 w-1 bg-emerald-500 rounded-full"></span>
            <h3 className="text-lg font-bold text-slate-800">Price Sensitivity</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-8">
            {QUESTIONS.priceSensitivity.map(q => (
              <RatingRow key={q.id} question={q} value={scores[q.id]} onChange={handleRatingChange} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="h-6 w-1 bg-blue-500 rounded-full"></span>
            <h3 className="text-lg font-bold text-slate-800">Friction to Adopt</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-8">
            {QUESTIONS.frictionToAdopt.map(q => (
              <RatingRow key={q.id} question={q} value={scores[q.id]} onChange={handleRatingChange} />
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex justify-center backdrop-blur-md bg-white/90">
        <div className="w-full max-w-lg">
          <button
            onClick={() => setStep('result')}
            disabled={!isAssessmentComplete}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold shadow-lg disabled:opacity-30 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isAssessmentComplete ? 'Analyze Results' : 'Complete All Items'} 
            {isAssessmentComplete && <CheckCircle2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!results) return null;
    
    // Data formatting for Recharts
    const chartData = [
      { x: results.x, y: results.y, name: industryName, z: 1 }
    ];

    // Determine Quadrant Description
    let quadrantTitle = "";
    let quadrantDesc = "";
    
    if (results.x >= 0 && results.y >= 0) {
      quadrantTitle = "High Friction / High Sensitivity";
      quadrantDesc = "Difficult Market. High barriers to entry and price conscious buyers.";
    } else if (results.x < 0 && results.y >= 0) {
      quadrantTitle = "Low Friction / High Sensitivity";
      quadrantDesc = "Commodity Market. Easy to adopt, but buyers are very price driven.";
    } else if (results.x >= 0 && results.y < 0) {
      quadrantTitle = "High Friction / Low Sensitivity";
      quadrantDesc = "Enterprise/Niche. Hard to implement, but budgets are open.";
    } else {
      quadrantTitle = "Low Friction / Low Sensitivity";
      quadrantDesc = "Sweet Spot. Easy adoption and buyers aren't price sensitive.";
    }

    return (
      <div className="flex flex-col h-full px-4 pt-6 pb-8 animate-in zoom-in-95 duration-700">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{industryName}</h2>
            <p className="text-slate-500 text-sm mt-1">Assessment Result</p>
          </div>
          <button onClick={handleReset} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200">
            <RefreshCcw size={20} />
          </button>
        </div>

        {/* Chart Container */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-2 mb-6 relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Analysis Map</span>
          </div>
          
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Friction" 
                  domain={[-10, 10]} 
                  tickCount={5}
                  stroke="#94a3b8"
                  fontSize={10}
                  label={{ value: 'Friction to Adopt', position: 'bottom', offset: 0, fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Price Sensitivity" 
                  domain={[-10, 10]} 
                  tickCount={5}
                  stroke="#94a3b8"
                  fontSize={10}
                  label={{ value: 'Price Sensitivity', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Quadrant Lines */}
                <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={2} />
                <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={2} />
                
                {/* Labels for Quadrants (Background Context) */}
                <ReferenceLine x={5} y={5} stroke="none" label={{ position: 'center', value: 'Challenging', fill: '#ef4444', opacity: 0.1, fontSize: 16, fontWeight: 'bold' }} />
                <ReferenceLine x={-5} y={-5} stroke="none" label={{ position: 'center', value: 'Opportunity', fill: '#10b981', opacity: 0.1, fontSize: 16, fontWeight: 'bold' }} />

                <Scatter name={industryName} data={chartData} fill="#4f46e5">
                  <Cell fill="#4f46e5" />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insight Card */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Info className="text-indigo-600 mt-1 shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-indigo-900 mb-1">{quadrantTitle}</h4>
              <p className="text-indigo-700 text-sm leading-relaxed">{quadrantDesc}</p>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Price Sens.</p>
            <p className={`text-2xl font-bold ${results.y > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {results.y > 0 ? '+' : ''}{results.y}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Friction</p>
            <p className={`text-2xl font-bold ${results.x > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
               {results.x > 0 ? '+' : ''}{results.x}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      <div className="max-w-lg mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative border-x border-slate-100">
        
        {step === 'landing' && renderLanding()}
        {step === 'assessment' && renderAssessment()}
        {step === 'result' && renderResult()}

      </div>
    </div>
  );
}


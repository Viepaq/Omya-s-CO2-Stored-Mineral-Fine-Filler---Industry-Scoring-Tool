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
  Label,
  Text
} from 'recharts';
import { ChevronRight, RefreshCcw, Info, BarChart3, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label as UILabel } from './components/ui/label';
import { cn } from './lib/utils';

/**
 * CONFIGURATION & DATA
 */
const QUESTIONS = {
  frictionToAdopt: [
    { 
      id: 'f1', 
      text: 'Colour / ΔE tolerance',
      minLabel: 'Very strict white',
      maxLabel: 'Natural grey acceptable'
    },
    { 
      id: 'f2', 
      text: 'Purity effect',
      minLabel: 'High concern',
      maxLabel: 'Low concern'
    },
    { 
      id: 'f3', 
      text: 'Number or complication of jobs',
      minLabel: 'Major changes',
      maxLabel: 'Drop-in'
    },
    { 
      id: 'f4', 
      text: 'Packaging',
      minLabel: 'High concern',
      maxLabel: 'Low concern'
    },
    { 
      id: 'f5', 
      text: 'Volume',
      minLabel: 'No interest',
      maxLabel: 'High'
    },
  ],
  priceSensitivity: [
    { 
      id: 'p1', 
      text: 'Willingness to pay',
      minLabel: 'None',
      maxLabel: '>12% premium'
    },
    { 
      id: 'p2', 
      text: 'Performance parity',
      minLabel: 'Inferior',
      maxLabel: 'Equal/better'
    },
    { 
      id: 'p3', 
      text: 'Tax / other incentives',
      minLabel: 'None',
      maxLabel: 'Strong'
    },
    { 
      id: 'p4', 
      text: 'First-mover reluctance',
      minLabel: 'Will not pilot first',
      maxLabel: 'Happy to pilot'
    },
    { 
      id: 'p5', 
      text: 'Stated need',
      minLabel: 'No need',
      maxLabel: 'Clear need'
    },
  ],
  otherFactors: [
    { 
      id: 'o1', 
      text: 'Recyclability concerns',
      minLabel: 'Severe',
      maxLabel: 'None'
    },
    { 
      id: 'o2', 
      text: 'Particle size fit',
      minLabel: 'Outside range',
      maxLabel: 'Within target'
    },
    { 
      id: 'o3', 
      text: 'Risk of losing market share due to price',
      minLabel: 'High risk',
      maxLabel: 'Low risk'
    },
    { 
      id: 'o4', 
      text: 'CO2 certificates cheaper than switching',
      minLabel: 'Yes',
      maxLabel: 'No'
    },
    { 
      id: 'o5', 
      text: 'Locked-in to "original parts" / supplier',
      minLabel: 'Tight lock-in',
      maxLabel: 'Flexible multi-sourcing allowed'
    },
    { 
      id: 'o6', 
      text: 'Different filler supplier already fixed',
      minLabel: 'Fixed and non-negotiable',
      maxLabel: 'Not fixed'
    },
    { 
      id: 'o7', 
      text: 'Filler spread across value chain',
      minLabel: 'Tiny niche',
      maxLabel: 'Used widely'
    },
  ]
};

const RATING_OPTIONS = [
  { label: '--', value: -2, color: 'bg-red-950/50 text-red-400 border-red-900', activeColor: 'bg-red-600 text-white border-red-500' },
  { label: '-', value: -1, color: 'bg-orange-950/50 text-orange-400 border-orange-900', activeColor: 'bg-orange-600 text-white border-orange-500' },
  { label: '0', value: 0, color: 'bg-muted text-muted-foreground border-border', activeColor: 'bg-accent text-accent-foreground border-border' },
  { label: '+', value: 1, color: 'bg-emerald-950/50 text-emerald-400 border-emerald-900', activeColor: 'bg-emerald-600 text-white border-emerald-500' },
  { label: '++', value: 2, color: 'bg-blue-950/50 text-blue-400 border-blue-900', activeColor: 'bg-blue-600 text-white border-blue-500' },
];

/**
 * COMPONENT: RatingRow
 */
const RatingRow = ({ question, value, onChange, showLabels = true }) => {
  return (
    <div className="mb-8 last:mb-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-sm font-medium text-foreground mb-3">{question.text}</h3>
      <div className="flex justify-between gap-2 items-center">
        {showLabels && (
          <span className="text-[10px] text-muted-foreground w-24 text-left">
            {question.minLabel}
          </span>
        )}
        <div className="flex justify-center gap-2 flex-1">
          {RATING_OPTIONS.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.label}
                onClick={() => onChange(question.id, option.value)}
                className={cn(
                  "h-11 w-11 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 shadow-sm border",
                  isSelected ? option.activeColor : option.color,
                  isSelected && 'scale-110 shadow-lg ring-2 ring-offset-2 ring-offset-background ring-primary/20'
                )}
                aria-label={`Rate ${option.label}`}
                aria-pressed={isSelected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {showLabels && (
          <span className="text-[10px] text-muted-foreground w-24 text-right">
            {question.maxLabel}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * COMPONENT: OtherFactorRow (with checkbox)
 */
const OtherFactorRow = ({ question, value, enabled, onToggle, onChange }) => {
  return (
    <div className="mb-8 last:mb-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-start gap-3 mb-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(question.id, e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <h3 className="text-sm font-medium text-foreground">{question.text}</h3>
      </div>
      {enabled && (
        <div className="flex justify-between gap-2 items-center ml-7">
          <span className="text-[10px] text-muted-foreground w-24 text-left">
            {question.minLabel}
          </span>
          <div className="flex justify-center gap-2 flex-1">
            {RATING_OPTIONS.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.label}
                  onClick={() => onChange(question.id, option.value)}
                  className={cn(
                    "h-11 w-11 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 shadow-sm border",
                    isSelected ? option.activeColor : option.color,
                    isSelected && 'scale-110 shadow-lg ring-2 ring-offset-2 ring-offset-background ring-primary/20'
                  )}
                  aria-label={`Rate ${option.label}`}
                  aria-pressed={isSelected}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-muted-foreground w-24 text-right">
            {question.maxLabel}
          </span>
        </div>
      )}
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
      <Card className="p-3 text-xs shadow-xl">
        <p className="font-bold text-foreground">{data.name}</p>
        <p className="text-muted-foreground">Friction: {data.x}</p>
        <p className="text-muted-foreground">Price Sens: {data.y}</p>
      </Card>
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
      className="fill-muted-foreground/30"
      style={{ fontSize: '16px', fontWeight: 'bold' }}
    >
      {value}
    </Text>
  );
};

/**
 * MAIN COMPONENT: App
 */
export default function App() {
  // State
  const [step, setStep] = useState('landing'); // landing | assessment | result
  const [industryName, setIndustryName] = useState('');
  const [scores, setScores] = useState({});
  const [otherFactorsEnabled, setOtherFactorsEnabled] = useState({});

  // Handlers
  const handleRatingChange = (id, value) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const handleOtherFactorToggle = (id, enabled) => {
    setOtherFactorsEnabled(prev => ({ ...prev, [id]: enabled }));
    if (!enabled) {
      // Remove score if disabled
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[id];
        return newScores;
      });
    }
  };

  const handleStart = () => {
    if (industryName.trim()) setStep('assessment');
  };

  const handleReset = () => {
    setScores({});
    setOtherFactorsEnabled({});
    setIndustryName('');
    setStep('landing');
  };

  // Calculations
  const isAssessmentComplete = useMemo(() => {
    const requiredQuestions = [
      ...QUESTIONS.priceSensitivity,
      ...QUESTIONS.frictionToAdopt
    ];
    
    // Check all required questions are answered
    const requiredComplete = requiredQuestions.every(q => scores[q.id] !== undefined);
    
    // Check all enabled other factors are answered
    const enabledOtherFactors = QUESTIONS.otherFactors.filter(q => otherFactorsEnabled[q.id]);
    const otherFactorsComplete = enabledOtherFactors.every(q => scores[q.id] !== undefined);
    
    return requiredComplete && otherFactorsComplete;
  }, [scores, otherFactorsEnabled]);

  const results = useMemo(() => {
    if (step !== 'result') return null;

    // X-Axis: Friction to Adopt (inverted for the chart - negative = low friction = good)
    const frictionScore = QUESTIONS.frictionToAdopt.reduce((acc, q) => acc + (scores[q.id] || 0), 0);
    
    // Y-Axis: Price Sensitivity (inverted - negative = low sensitivity = good)
    const priceScore = QUESTIONS.priceSensitivity.reduce((acc, q) => acc + (scores[q.id] || 0), 0);

    // Other factors (half weight)
    const enabledOtherFactors = QUESTIONS.otherFactors.filter(q => otherFactorsEnabled[q.id]);
    const otherScore = enabledOtherFactors.reduce((acc, q) => acc + (scores[q.id] || 0) * 0.5, 0);

    // Total score calculation
    const totalRawScore = frictionScore + priceScore + otherScore;
    
    // Max possible score
    const maxRegularScore = (QUESTIONS.frictionToAdopt.length + QUESTIONS.priceSensitivity.length) * 2;
    const maxOtherScore = enabledOtherFactors.length * 2 * 0.5;
    const maxScore = maxRegularScore + maxOtherScore;

    return { 
      x: frictionScore, 
      y: priceScore,
      otherScore,
      totalScore: totalRawScore,
      maxScore
    };
  }, [scores, otherFactorsEnabled, step]);

  // Render Helpers
  const renderLanding = () => (
    <div className="flex flex-col h-full justify-center px-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8 text-center space-y-4">
        <div className="h-20 w-20 bg-primary rounded-3xl mx-auto shadow-xl flex items-center justify-center mb-6">
          <BarChart3 className="text-primary-foreground h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Industry Scoring<br/>Framework
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Evaluate industry viability based on friction to adopt and price sensitivity.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <UILabel htmlFor="industry" className="block mb-2">
            Industry or Company Name
          </UILabel>
          <Input
            id="industry"
            type="text"
            value={industryName}
            onChange={(e) => setIndustryName(e.target.value)}
            placeholder="e.g. Packaging"
            className="text-lg py-6"
            autoFocus
          />
        </div>
        
        <Button
          onClick={handleStart}
          disabled={!industryName.trim()}
          className="w-full py-6 text-lg"
          size="lg"
        >
          Start Assessment <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );

  const renderAssessment = () => {
    const totalRequired = QUESTIONS.priceSensitivity.length + QUESTIONS.frictionToAdopt.length;
    const enabledOtherCount = QUESTIONS.otherFactors.filter(q => otherFactorsEnabled[q.id]).length;
    const totalQuestions = totalRequired + enabledOtherCount;
    const answeredCount = Object.keys(scores).length;

    return (
      <div className="px-4 pb-24 animate-in slide-in-from-right-8 duration-500">
        <div className="py-6 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border mb-6">
          <div className="flex justify-between items-baseline">
            <h2 className="text-xl font-bold text-foreground truncate pr-4">{industryName}</h2>
            <span className="text-xs font-semibold px-3 py-1 bg-muted text-muted-foreground rounded-full">
              {answeredCount} / {totalQuestions}
            </span>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="h-6 w-1 bg-blue-500 rounded-full"></span>
              <h3 className="text-lg font-bold text-foreground">Friction to Adopt</h3>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-8">
                {QUESTIONS.frictionToAdopt.map(q => (
                  <RatingRow key={q.id} question={q} value={scores[q.id]} onChange={handleRatingChange} />
                ))}
              </CardContent>
            </Card>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="h-6 w-1 bg-emerald-500 rounded-full"></span>
              <h3 className="text-lg font-bold text-foreground">Price Sensitivity</h3>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-8">
                {QUESTIONS.priceSensitivity.map(q => (
                  <RatingRow key={q.id} question={q} value={scores[q.id]} onChange={handleRatingChange} />
                ))}
              </CardContent>
            </Card>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="h-6 w-1 bg-purple-500 rounded-full"></span>
              <h3 className="text-lg font-bold text-foreground">Other Factors</h3>
              <span className="text-xs text-muted-foreground">(optional, half weight)</span>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-8">
                {QUESTIONS.otherFactors.map(q => (
                  <OtherFactorRow 
                    key={q.id} 
                    question={q} 
                    value={scores[q.id]}
                    enabled={otherFactorsEnabled[q.id] || false}
                    onToggle={handleOtherFactorToggle}
                    onChange={handleRatingChange} 
                  />
                ))}
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border flex justify-center">
          <div className="w-full max-w-lg">
            <Button
              onClick={() => setStep('result')}
              disabled={!isAssessmentComplete}
              className="w-full py-6"
              size="lg"
            >
              {isAssessmentComplete ? 'Analyze Results' : 'Complete All Items'} 
              {isAssessmentComplete && <CheckCircle2 size={18} />}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!results) return null;
    
    // Data formatting for Recharts
    const chartData = [
      { x: results.x, y: results.y, name: industryName, z: 1 }
    ];

    // Determine if in opportunity quadrant (top-right: positive friction, positive price sensitivity)
    const isOpportunity = results.x > 0 && results.y > 0;

    return (
      <div className="flex flex-col h-full px-4 pt-6 pb-8 animate-in zoom-in-95 duration-700">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{industryName}</h2>
            <p className="text-muted-foreground text-sm mt-1">Assessment Result</p>
          </div>
          <Button onClick={handleReset} variant="outline" size="icon" className="rounded-full">
            <RefreshCcw size={20} />
          </Button>
        </div>

        {/* Total Score Display */}
        <Card className="mb-6 bg-primary/10 border-primary/20">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Total Score</p>
            <p className="text-4xl font-bold text-foreground">
              {results.totalScore.toFixed(1)}/{results.maxScore.toFixed(1)}
            </p>
          </CardContent>
        </Card>

        {/* Chart Container */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-4">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Friction" 
                    domain={[-10, 10]} 
                    tickCount={5}
                    className="stroke-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ 
                      value: 'Friction to Adopt', 
                      position: 'bottom', 
                      offset: 0, 
                      style: { fill: 'hsl(var(--muted-foreground))' }
                    }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Price Sensitivity" 
                    domain={[-10, 10]} 
                    tickCount={5}
                    className="stroke-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ 
                      value: 'Price Sensitivity', 
                      angle: -90, 
                      position: 'insideLeft', 
                      offset: 10,
                      style: { fill: 'hsl(var(--muted-foreground))' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  
                  {/* Quadrant Lines */}
                  <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={2} />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
                  
                  {/* Quadrant Labels - Opportunity top right, rest Challenging */}
                  <ReferenceLine 
                    x={5} 
                    y={5} 
                    stroke="none" 
                    label={<QuadrantLabel value="Opportunity" x={0.75} y={0.15} />} 
                  />
                  <ReferenceLine 
                    x={-5} 
                    y={5} 
                    stroke="none" 
                    label={<QuadrantLabel value="Challenging" x={0.25} y={0.15} />} 
                  />
                  <ReferenceLine 
                    x={-5} 
                    y={-5} 
                    stroke="none" 
                    label={<QuadrantLabel value="Challenging" x={0.25} y={0.85} />} 
                  />
                  <ReferenceLine 
                    x={5} 
                    y={-5} 
                    stroke="none" 
                    label={<QuadrantLabel value="Challenging" x={0.75} y={0.85} />} 
                  />

                  <Scatter name={industryName} data={chartData} fill="hsl(var(--primary))">
                    <Cell fill="hsl(var(--primary))" />
                  </Scatter>
                  
                  {/* Industry name label above the point */}
                  {chartData.map((entry, index) => (
                    <Text 
                      key={`label-${index}`}
                      x={entry.x} 
                      y={entry.y} 
                      textAnchor="middle"
                      dy={-20}
                      style={{ 
                        fill: 'hsl(var(--foreground))', 
                        fontSize: '12px', 
                        fontWeight: 'bold' 
                      }}
                    >
                      {entry.name}
                    </Text>
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Insight Card */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="text-primary mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-foreground mb-1">
                  {isOpportunity ? 'Opportunity Zone' : 'Challenging Territory'}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isOpportunity 
                    ? 'This industry/company shows positive indicators for both adoption readiness and pricing flexibility.'
                    : 'This industry/company faces challenges in one or more critical dimensions. Further analysis recommended.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">
                Friction
              </p>
              <p className={cn(
                "text-2xl font-bold",
                results.x > 0 ? 'text-red-500' : 'text-emerald-500'
              )}>
                {results.x > 0 ? '+' : ''}{results.x}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">
                Price Sens.
              </p>
              <p className={cn(
                "text-2xl font-bold",
                results.y > 0 ? 'text-red-500' : 'text-emerald-500'
              )}>
                {results.y > 0 ? '+' : ''}{results.y}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto min-h-screen bg-background shadow-2xl overflow-hidden relative border-x border-border">
        {step === 'landing' && renderLanding()}
        {step === 'assessment' && renderAssessment()}
        {step === 'result' && renderResult()}
      </div>
    </div>
  );
}

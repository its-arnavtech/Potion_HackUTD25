import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Lightbulb,
  ClipboardCheck,
  TrendingUp,
  Zap,
  Sparkles
} from 'lucide-react';
import { analyzeDiscrepancies } from '@/services/aiService';
import { backgroundData } from '@/data/backgroundData';
import { ticketsData } from '@/data/ticketsData';
import { generateMockDiscrepancies, generateMockCauldronData } from '@/utils/mockData';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AIAgent() {
  const [discrepancies, setDiscrepancies] = useState([]);
  const [cauldronData, setCauldronData] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [hasRun, setHasRun] = useState(false);
  const [resolvedCount, setResolvedCount] = useState(0);

  useEffect(() => {
    // Load current discrepancies and cauldron data
    const mockDiscrepancies = generateMockDiscrepancies(ticketsData, backgroundData.cauldrons);
    const mockCauldrons = generateMockCauldronData(backgroundData.cauldrons);
    
    setDiscrepancies(mockDiscrepancies);
    setCauldronData(mockCauldrons);
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setHasRun(false);
    setResolvedCount(0);
    
    toast.info('🤖 AI Agent is analyzing and resolving discrepancies...', {
      duration: 3000,
    });

    try {
      const result = await analyzeDiscrepancies(discrepancies, cauldronData);
      
      if (result.success) {
        setAnalysis(result.analysis);
        setHasRun(true);
        
        // Mark discrepancies as resolved based on agent's decisions
        if (result.resolvedDiscrepancies && result.resolvedDiscrepancies.length > 0) {
          setDiscrepancies(prev => prev.map(d => 
            result.resolvedDiscrepancies.includes(d.id) 
              ? { ...d, resolved: true } 
              : d
          ));
          setResolvedCount(result.resolvedDiscrepancies.length);
          toast.success(`✅ Agent resolved ${result.resolvedDiscrepancies.length} discrepancies!`, {
            duration: 5000,
          });
        } else {
          toast.success('Analysis complete!');
        }
      } else {
        toast.error('Analysis failed. Please try again.');
        console.error('Analysis error:', result.error);
      }
    } catch (error) {
      console.error('AI Agent error:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stats = {
    total: discrepancies.length,
    high: discrepancies.filter(d => d.severity === 'high').length,
    medium: discrepancies.filter(d => d.severity === 'medium').length,
    low: discrepancies.filter(d => d.severity === 'low').length,
    resolved: discrepancies.filter(d => d.resolved).length,
    unresolved: discrepancies.filter(d => !d.resolved).length
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">AI Agent</h1>
            <Badge className="bg-accent text-accent-foreground">
              <Zap className="w-3 h-3 mr-1" />
              Autonomous
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            Advanced AI-powered discrepancy analysis and resolution planning
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Issues</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </Card>
          <Card className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Unresolved</p>
            <p className="text-2xl font-bold text-warning">{stats.unresolved}</p>
          </Card>
          <Card className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">High Priority</p>
            <p className="text-2xl font-bold text-destructive">{stats.high}</p>
          </Card>
          <Card className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Medium</p>
            <p className="text-2xl font-bold text-warning">{stats.medium}</p>
          </Card>
          <Card className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Low</p>
            <p className="text-2xl font-bold text-accent">{stats.low}</p>
          </Card>
          <Card className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Resolved</p>
            <p className="text-2xl font-bold text-success">{stats.resolved}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Control Panel */}
          <div className="space-y-6">
            {/* Agent Control */}
            <Card className="glass-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Agent Control</h2>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Deploy the AI agent to analyze all discrepancies, identify patterns, and generate a comprehensive resolution plan.
              </p>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-6">
                <p className="text-xs text-primary font-medium mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  🤖 Autonomous Mode
                </p>
                <p className="text-xs text-muted-foreground">
                  This agent analyzes issues AND takes action to resolve them automatically. Resolutions are applied in real-time with full audit trail.
                </p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || stats.total === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Analyze & Resolve
                  </>
                )}
              </Button>

              {stats.total === 0 && (
                <p className="text-xs text-center text-muted-foreground mt-3">
                  No discrepancies to analyze
                </p>
              )}
            </Card>

            {/* What the Agent Does */}
            <Card className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">Agent Capabilities</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Pattern recognition across temporal and spatial dimensions
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Root cause analysis using 7+ diagnostic frameworks
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Impact assessment with financial calculations
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Multi-layered solution plans (immediate to long-term)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Preventive measures and monitoring strategies
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">Autonomous resolution</strong> of discrepancies with confidence scoring
                  </p>
                </div>
              </div>
            </Card>

            {/* Status Indicator */}
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Agent Status</span>
                <div className={`flex items-center gap-2 ${isAnalyzing ? 'text-accent' : hasRun ? 'text-success' : 'text-muted-foreground'}`}>
                  <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-accent animate-pulse' : hasRun ? 'bg-success' : 'bg-muted'}`} />
                  <span className="text-sm font-semibold">
                    {isAnalyzing ? 'Running' : hasRun ? 'Complete' : 'Idle'}
                  </span>
                </div>
              </div>
              
              {isAnalyzing && (
                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-accent h-full rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Processing {stats.unresolved} unresolved discrepancies...
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2">
            {!analysis && !isAnalyzing && (
              <Card className="glass-card p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="relative inline-block mb-6">
                    <Bot className="w-20 h-20 text-primary/50 mx-auto" />
                    <div className="absolute inset-0 blur-xl bg-primary/20 -z-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    AI Agent Ready
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Analyze & Resolve" to deploy the autonomous agent. 
                    It will analyze all issues, identify root causes, and AUTOMATICALLY RESOLVE problems it's confident about.
                  </p>
                  <div className="bg-primary/10 rounded-lg p-4 mb-6 text-left border border-primary/30">
                    <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      🤖 Autonomous Mode Active
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This agent has execution capabilities and will automatically resolve discrepancies with high confidence scores. 
                      All actions are logged with full audit trail and reasoning.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span>Powered by advanced AI reasoning</span>
                  </div>
                </div>
              </Card>
            )}

            {isAnalyzing && (
              <Card className="glass-card p-12 text-center">
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Analysis in Progress
                </h3>
                <p className="text-muted-foreground mb-6">
                  The AI agent is examining discrepancy patterns, conducting root cause analysis, 
                  and formulating resolution strategies...
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span>Analyzing {stats.total} discrepancies</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span>Evaluating {backgroundData.cauldrons.length} cauldrons</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <span>Generating action plan</span>
                  </div>
                </div>
              </Card>
            )}

            {analysis && !isAnalyzing && (
              <Card className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-success" />
                    <h2 className="text-xl font-semibold text-foreground">Analysis Report</h2>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                </div>

                {resolvedCount > 0 && (
                  <div className="mb-4 bg-success/10 border border-success/30 rounded-lg p-4">
                    <p className="text-sm font-semibold text-success flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      ✅ Agent successfully resolved {resolvedCount} discrepanc{resolvedCount === 1 ? 'y' : 'ies'}
                    </p>
                  </div>
                )}

                <div className="bg-muted/30 rounded-lg p-6 border border-border">
                  <div className="prose prose-invert prose-sm max-w-none markdown-content">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-foreground mb-4 mt-6" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-foreground mb-3 mt-5" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-foreground mb-2 mt-4" {...props} />,
                        p: ({node, ...props}) => <p className="text-sm text-muted-foreground mb-3 leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-muted-foreground" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-muted-foreground" {...props} />,
                        li: ({node, ...props}) => <li className="ml-2" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-accent" {...props} />,
                        code: ({node, inline, ...props}) => 
                          inline ? 
                            <code className="bg-muted px-1 py-0.5 rounded text-xs text-accent" {...props} /> :
                            <code className="block bg-muted p-3 rounded text-xs overflow-x-auto" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground" {...props} />,
                      }}
                    >
                      {analysis}
                    </ReactMarkdown>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={handleAnalyze}
                    variant="outline"
                    className="glass-card"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Again
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(analysis);
                      toast.success('Analysis copied to clipboard!');
                    }}
                    variant="outline"
                    className="glass-card"
                  >
                    Copy Report
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Discrepancy Preview */}
        {discrepancies.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              Current Discrepancies ({stats.unresolved} unresolved)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discrepancies.slice(0, 6).map((disc) => (
                <Card key={disc.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground text-sm">{disc.cauldronName}</h3>
                    <Badge className={
                      disc.severity === 'high' ? 'bg-destructive text-destructive-foreground' :
                      disc.severity === 'medium' ? 'bg-warning text-warning-foreground' :
                      'bg-accent text-accent-foreground'
                    }>
                      {disc.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{disc.description}</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Variance:</span>
                      <span className={`font-semibold ${disc.variance > 0 ? 'text-accent' : 'text-destructive'}`}>
                        {disc.variance > 0 ? '+' : ''}{disc.variance}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="text-foreground">{disc.date}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Activity, AlertTriangle, TrendingUp, Droplet, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import CauldronCard from '@/components/CauldronCard';
import MetricCard from '@/components/MetricCard';
import ActivityChart from '@/components/ActivityChart';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { backgroundData } from '@/data/backgroundData';
import { ticketsData } from '@/data/ticketsData';
import { generateMockCauldronData } from '@/utils/mockData';

export default function Dashboard() {
  const [cauldronData, setCauldronData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalVolume: 0,
    activeCollections: 0,
    discrepancies: 0,
    efficiency: 0
  });

  useEffect(() => {
    // Generate mock real-time data for cauldrons
    const mockData = generateMockCauldronData(backgroundData.cauldrons);
    setCauldronData(mockData);

    // Calculate metrics
    const total = mockData.reduce((sum, c) => sum + c.currentVolume, 0);
    const active = mockData.filter(c => c.status === 'collecting').length;
    const issues = mockData.filter(c => c.hasDiscrepancy).length;
    const eff = Math.round((total / mockData.reduce((sum, c) => sum + c.maxVolume, 0)) * 100);

    setMetrics({
      totalVolume: Math.round(total),
      activeCollections: active,
      discrepancies: issues,
      efficiency: eff
    });

    // Simulate real-time updates
    const interval = setInterval(() => {
      const updatedData = generateMockCauldronData(backgroundData.cauldrons);
      setCauldronData(updatedData);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 py-12 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-8 h-8 text-primary" />
                <h1 className="text-5xl font-bold text-foreground">Cauldron Network</h1>
              </div>
              <p className="text-xl text-muted-foreground">Real-time Potion Flow Monitoring & Discrepancy Detection</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-accent border-accent px-4 py-2">
                <Activity className="w-4 h-4 mr-2" />
                Live Monitoring
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Potion Volume"
            value={`${metrics.totalVolume}L`}
            icon={Droplet}
            trend="+12%"
            color="primary"
          />
          <MetricCard
            title="Active Collections"
            value={metrics.activeCollections}
            icon={Activity}
            trend="+3"
            color="accent"
          />
          <MetricCard
            title="Discrepancies Detected"
            value={metrics.discrepancies}
            icon={AlertTriangle}
            trend="-2"
            color="destructive"
          />
          <MetricCard
            title="Network Efficiency"
            value={`${metrics.efficiency}%`}
            icon={TrendingUp}
            trend="+5%"
            color="success"
          />
        </div>

        {/* Activity Chart */}
        <div className="mb-8">
          <ActivityChart />
        </div>

        {/* Cauldrons Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Live Cauldron Status
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cauldronData.map((cauldron) => (
            <CauldronCard key={cauldron.id} cauldron={cauldron} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <NavLink to="/map">
            <Card className="glass-card p-6 hover:glow-primary transition-all duration-300 cursor-pointer group">
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">Network Map</h3>
              <p className="text-muted-foreground">Visualize cauldron locations and transport routes</p>
            </Card>
          </NavLink>
          
          <NavLink to="/discrepancies">
            <Card className="glass-card p-6 hover:glow-accent transition-all duration-300 cursor-pointer group">
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">Analyze Discrepancies</h3>
              <p className="text-muted-foreground">Detect and resolve ticket mismatches</p>
            </Card>
          </NavLink>
          
          <NavLink to="/history">
            <Card className="glass-card p-6 hover:glow-primary transition-all duration-300 cursor-pointer group">
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">Historical Playback</h3>
              <p className="text-muted-foreground">Review past potion flow and events</p>
            </Card>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, TrendingUp, Navigation as NavigationIcon, AlertTriangle } from 'lucide-react';
import { backgroundData } from '@/data/backgroundData';
import { generateMockCauldronData } from '@/utils/mockData';

export default function NetworkMap() {
  const [cauldronData, setCauldronData] = useState([]);
  const [selectedCauldron, setSelectedCauldron] = useState(null);

  useEffect(() => {
    // Initial load
    const mockData = generateMockCauldronData(backgroundData.cauldrons);
    setCauldronData(mockData);

    // Update every 1 second to track discrepancies in real-time
    const interval = setInterval(() => {
      const updatedData = generateMockCauldronData(backgroundData.cauldrons);
      setCauldronData(updatedData);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'normal': return { bg: 'bg-[#4ade80]', border: 'border-[#4ade80]', glow: '#4ade80', text: 'text-[#4ade80]' }; // Softer Green
      case 'collecting': return { bg: 'bg-[#5eead4]', border: 'border-[#5eead4]', glow: '#5eead4', text: 'text-[#5eead4]' }; // Softer Teal
      case 'warning': return { bg: 'bg-[#fbbf24]', border: 'border-[#fbbf24]', glow: '#fbbf24', text: 'text-[#fbbf24]' }; // Softer Orange
      case 'critical': return { bg: 'bg-[#f87171]', border: 'border-[#f87171]', glow: '#f87171', text: 'text-[#f87171]' }; // Softer Red
      default: return { bg: 'bg-gray-500', border: 'border-gray-500', glow: '#6b7280', text: 'text-gray-500' };
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            Network Map
          </h1>
          <p className="text-muted-foreground text-lg">Interactive visualization of the Cauldron Network</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Visualization */}
          <div className="lg:col-span-2">
            <Card className="glass-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Network Topology</h2>
                <Badge className="bg-primary text-primary-foreground">
                  12 Cauldrons Active
                </Badge>
              </div>
              
              {/* Stylized Map */}
              <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-8 min-h-[700px] border border-border overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
                    {Array.from({ length: 144 }).map((_, i) => (
                      <div key={i} className="border border-primary/20" />
                    ))}
                  </div>
                </div>

                {/* SVG for all connection lines - behind everything */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: 'hsl(259 88% 65%)', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: 'hsl(165 95% 44%)', stopOpacity: 0.4 }} />
                    </linearGradient>
                  </defs>
                  {cauldronData.map((cauldron, index) => {
                    const angle = (index / cauldronData.length) * 2 * Math.PI;
                    const radius = 250;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    // Calculate absolute positions for the line
                    const svgWidth = 100; // percentage based
                    const svgHeight = 100;
                    const centerX = 50;
                    const centerY = 50;
                    const cauldronX = centerX + (x / 600) * 100; // 600px is approximate width
                    const cauldronY = centerY + (y / 700) * 100; // 700px is approximate height
                    
                    return (
                      <line
                        key={`line-${cauldron.id}`}
                        x1={`${centerX}%`}
                        y1={`${centerY}%`}
                        x2={`${cauldronX}%`}
                        y2={`${cauldronY}%`}
                        stroke="url(#lineGradient)"
                        strokeWidth="2"
                        strokeDasharray="6,4"
                        className="animate-pulse-slow"
                      />
                    );
                  })}
                </svg>

                {/* Market Center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-purple-500 rounded-full blur-2xl opacity-25 group-hover:opacity-40 transition-opacity animate-pulse" />
                    <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 rounded-full p-8 border-4 border-purple-400/70 shadow-2xl">
                      <Zap className="w-10 h-10 text-white/90 animate-pulse" />
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <p className="text-center text-sm font-bold text-purple-400/90 bg-background/90 px-3 py-1 rounded-full border border-purple-500/30">
                        Enchanted Market
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cauldrons positioned around center */}
                {cauldronData.map((cauldron, index) => {
                  const angle = (index / cauldronData.length) * 2 * Math.PI;
                  const radius = 250;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const colors = getStatusColor(cauldron.status);

                  return (
                    <div
                      key={cauldron.id}
                      className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`
                      }}
                      onClick={() => setSelectedCauldron(cauldron)}
                    >
                      <div className="relative group">
                        {/* Glow effect */}
                        <div 
                          className={`absolute inset-0 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity animate-pulse`}
                          style={{ backgroundColor: colors.glow }}
                        />
                        
                        {/* Main cauldron node */}
                        <div className={`relative ${colors.bg} rounded-full p-5 border-4 ${colors.border} shadow-xl`}>
                          <div className="w-6 h-6 bg-white rounded-full opacity-90" />
                        </div>
                        
                        {/* Status indicator dot */}
                        <div className={`absolute -top-1 -right-1 w-4 h-4 ${colors.bg} rounded-full border-2 border-background animate-pulse shadow-lg`} />
                        
                        {/* Cauldron name label */}
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          <p className={`text-xs font-bold ${colors.text} bg-background/95 px-2 py-1 rounded border ${colors.border}/30 shadow-lg`}>
                            {cauldron.name.replace(' Cauldron', '').split(' ')[0]}
                          </p>
                        </div>
                        
                        {/* Volume indicator on hover */}
                        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <p className="text-xs text-muted-foreground bg-background/95 px-2 py-1 rounded border border-border shadow-lg">
                            {Math.round((cauldron.currentVolume / cauldron.maxVolume) * 100)}% full
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Legend */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Status Legend
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/30 transition-colors">
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-[#4ade80] border-2 border-[#4ade80] shadow-lg" />
                    <div className="absolute inset-0 bg-[#4ade80] rounded-full blur-md opacity-50" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Normal Operation</p>
                    <p className="text-xs text-muted-foreground">Running smoothly</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/30 transition-colors">
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-[#5eead4] border-2 border-[#5eead4] shadow-lg" />
                    <div className="absolute inset-0 bg-[#5eead4] rounded-full blur-md opacity-50" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Collection Active</p>
                    <p className="text-xs text-muted-foreground">Courier present</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/30 transition-colors">
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-[#fbbf24] border-2 border-[#fbbf24] shadow-lg animate-pulse" />
                    <div className="absolute inset-0 bg-[#fbbf24] rounded-full blur-md opacity-50" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Discrepancy Detected</p>
                    <p className="text-xs text-muted-foreground">Volume mismatch</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/30 transition-colors">
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-[#f87171] border-2 border-[#f87171] shadow-lg animate-pulse" />
                    <div className="absolute inset-0 bg-[#f87171] rounded-full blur-md opacity-50" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Critical Overflow</p>
                    <p className="text-xs text-muted-foreground">&gt;90% full - urgent</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Selected Cauldron Details */}
            {selectedCauldron && (
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Selected Cauldron</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-base font-medium text-foreground">{selectedCauldron.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Volume</p>
                    <p className="text-base font-medium text-foreground">{selectedCauldron.currentVolume}L / {selectedCauldron.maxVolume}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fill Rate</p>
                    <p className="text-base font-medium text-foreground">{selectedCauldron.fillRate}L/min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(selectedCauldron.status).bg} text-white mt-1 border-2 ${getStatusColor(selectedCauldron.status).border}`}>
                      {selectedCauldron.status.charAt(0).toUpperCase() + selectedCauldron.status.slice(1)}
                    </Badge>
                  </div>
                  {selectedCauldron.hasDiscrepancy && (
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-warning flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        Discrepancy Alert
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Volume mismatch detected - check transport tickets
                      </p>
                    </div>
                  )}
                  <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <NavigationIcon className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </Card>
            )}

            {/* Network Stats */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Network Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Cauldrons</span>
                  <span className="text-base font-medium text-foreground">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Couriers</span>
                  <span className="text-base font-medium text-foreground">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Travel Time</span>
                  <span className="text-base font-medium text-foreground">42 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Network Uptime</span>
                  <span className="text-base font-medium text-success">99.8%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, TrendingUp, Navigation as NavigationIcon } from 'lucide-react';
import { backgroundData } from '@/data/backgroundData';
import { generateMockCauldronData } from '@/utils/mockData';

export default function NetworkMap() {
  const [cauldronData, setCauldronData] = useState([]);
  const [selectedCauldron, setSelectedCauldron] = useState(null);

  useEffect(() => {
    const mockData = generateMockCauldronData(backgroundData.cauldrons);
    setCauldronData(mockData);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'normal': return 'bg-success';
      case 'collecting': return 'bg-accent';
      case 'warning': return 'bg-warning';
      case 'critical': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
              <div className="relative bg-muted/20 rounded-lg p-8 min-h-[600px] border border-border">
                {/* Grid background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-8 grid-rows-8 h-full">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className="border border-primary/20" />
                    ))}
                  </div>
                </div>

                {/* Market Center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-accent rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-accent rounded-full p-6 glow-accent">
                      <Zap className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <p className="text-center mt-2 text-sm font-semibold text-accent">Enchanted Market</p>
                  </div>
                </div>

                {/* Cauldrons positioned around center */}
                {cauldronData.map((cauldron, index) => {
                  const angle = (index / cauldronData.length) * 2 * Math.PI;
                  const radius = 220;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <div
                      key={cauldron.id}
                      className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`
                      }}
                      onClick={() => setSelectedCauldron(cauldron)}
                    >
                      <div className="relative group">
                        <div className={`absolute inset-0 ${getStatusColor(cauldron.status)} rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity`} />
                        <div className={`relative ${getStatusColor(cauldron.status)} rounded-full p-3 animate-pulse-glow`}>
                          <div className="w-4 h-4" />
                        </div>
                        {/* Connection line to center */}
                        <svg className="absolute top-1/2 left-1/2 pointer-events-none" style={{ width: Math.abs(x) * 2, height: Math.abs(y) * 2 }}>
                          <line
                            x1={x > 0 ? 0 : Math.abs(x) * 2}
                            y1={y > 0 ? 0 : Math.abs(y) * 2}
                            x2={x > 0 ? Math.abs(x) * 2 : 0}
                            y2={y > 0 ? Math.abs(y) * 2 : 0}
                            stroke="hsl(259 88% 65% / 0.2)"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />
                        </svg>
                      </div>
                      <p className="text-xs mt-1 text-center text-muted-foreground whitespace-nowrap">
                        {cauldron.name.split(' ')[0]}
                      </p>
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
              <h3 className="text-lg font-semibold text-foreground mb-4">Status Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground">Normal Operation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-accent" />
                  <span className="text-sm text-muted-foreground">Collection Active</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-warning" />
                  <span className="text-sm text-muted-foreground">Needs Attention</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-destructive" />
                  <span className="text-sm text-muted-foreground">Critical Level</span>
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
                    <Badge className={`${getStatusColor(selectedCauldron.status)} text-white mt-1`}>
                      {selectedCauldron.status}
                    </Badge>
                  </div>
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

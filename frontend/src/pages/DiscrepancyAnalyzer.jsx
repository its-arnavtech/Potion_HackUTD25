import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ticketsData } from '@/data/ticketsData';
import { backgroundData } from '@/data/backgroundData';
import { generateMockDiscrepancies } from '@/utils/mockData';
import { toast } from 'sonner';

export default function DiscrepancyAnalyzer() {
  const [discrepancies, setDiscrepancies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Generate mock discrepancies based on tickets data
    const mockDiscrepancies = generateMockDiscrepancies(ticketsData, backgroundData.cauldrons);
    setDiscrepancies(mockDiscrepancies);
  }, []);

  const filteredDiscrepancies = discrepancies.filter(d => {
    const matchesFilter = filter === 'all' || d.severity === filter;
    const matchesSearch = d.cauldronName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.date.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-accent';
      default: return 'bg-muted';
    }
  };

  const handleResolve = (id) => {
    setDiscrepancies(prev => prev.map(d => 
      d.id === id ? { ...d, resolved: true } : d
    ));
    toast.success('Discrepancy marked as resolved');
  };

  const stats = {
    total: discrepancies.length,
    high: discrepancies.filter(d => d.severity === 'high').length,
    medium: discrepancies.filter(d => d.severity === 'medium').length,
    low: discrepancies.filter(d => d.severity === 'low').length,
    resolved: discrepancies.filter(d => d.resolved).length
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-primary" />
            Discrepancy Analyzer
          </h1>
          <p className="text-muted-foreground text-lg">Detect and resolve potion transport discrepancies</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Issues</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </Card>
          <Card className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">High Severity</p>
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

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by cauldron or date..."
              className="pl-10 glass-card"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-primary text-primary-foreground' : ''}
            >
              All
            </Button>
            <Button
              variant={filter === 'high' ? 'default' : 'outline'}
              onClick={() => setFilter('high')}
              className={filter === 'high' ? 'bg-destructive text-destructive-foreground' : ''}
            >
              High
            </Button>
            <Button
              variant={filter === 'medium' ? 'default' : 'outline'}
              onClick={() => setFilter('medium')}
              className={filter === 'medium' ? 'bg-warning text-warning-foreground' : ''}
            >
              Medium
            </Button>
            <Button
              variant={filter === 'low' ? 'default' : 'outline'}
              onClick={() => setFilter('low')}
              className={filter === 'low' ? 'bg-accent text-accent-foreground' : ''}
            >
              Low
            </Button>
          </div>
        </div>

        {/* Discrepancies List */}
        <div className="space-y-4">
          {filteredDiscrepancies.map((discrepancy) => (
            <Card key={discrepancy.id} className={`glass-card p-6 ${discrepancy.resolved ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${getSeverityColor(discrepancy.severity)} text-white`}>
                      {discrepancy.severity.toUpperCase()}
                    </Badge>
                    {discrepancy.resolved && (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{discrepancy.cauldronName}</h3>
                  <p className="text-muted-foreground mb-3">{discrepancy.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="text-foreground font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {discrepancy.date}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Volume</p>
                      <p className="text-foreground font-medium">{discrepancy.expectedVolume}L</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Actual Volume</p>
                      <p className="text-foreground font-medium">{discrepancy.actualVolume}L</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Variance</p>
                      <p className={`font-medium ${discrepancy.variance > 0 ? 'text-accent' : 'text-destructive'}`}>
                        {discrepancy.variance > 0 ? '+' : ''}{discrepancy.variance}L
                      </p>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {!discrepancy.resolved && (
                    <Button
                      onClick={() => handleResolve(discrepancy.id)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredDiscrepancies.length === 0 && (
          <Card className="glass-card p-12 text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Discrepancies Found</h3>
            <p className="text-muted-foreground">All transport tickets match the actual drain volumes</p>
          </Card>
        )}
      </div>
    </div>
  );
}

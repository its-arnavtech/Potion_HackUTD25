import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Droplet, TrendingUp, AlertTriangle } from 'lucide-react';

export const CauldronCard = ({ cauldron }) => {
  const fillPercentage = (cauldron.currentVolume / cauldron.maxVolume) * 100;
  
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
    <Card className="glass-card p-5 hover:glow-primary transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {cauldron.name}
          </h3>
          <p className="text-xs text-muted-foreground">{cauldron.id}</p>
        </div>
        <Badge className={`${getStatusColor(cauldron.status)} text-white`}>
          {cauldron.status}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Droplet className="w-3 h-3" />
              Volume
            </span>
            <span className="text-sm font-medium text-foreground">
              {cauldron.currentVolume}L / {cauldron.maxVolume}L
            </span>
          </div>
          <Progress value={fillPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground mb-1">Fill Rate</p>
            <p className="text-foreground font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-accent" />
              {cauldron.fillRate} L/min
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Time to Full</p>
            <p className="text-foreground font-medium">{cauldron.timeToFull}</p>
          </div>
        </div>

        {cauldron.hasDiscrepancy && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-destructive font-medium">Discrepancy detected</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CauldronCard;

import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const MetricCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const isPositive = trend?.startsWith('+');
  
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    accent: 'text-accent bg-accent/10',
    success: 'text-success bg-success/10',
    destructive: 'text-destructive bg-destructive/10',
    warning: 'text-warning bg-warning/10'
  };

  return (
    <Card className="glass-card p-5 hover:glow-primary transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            isPositive ? 'text-success' : 'text-destructive'
          }`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </Card>
  );
};

export default MetricCard;

import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', collected: 450, transported: 420, discrepancies: 30 },
  { day: 'Tue', collected: 520, transported: 510, discrepancies: 10 },
  { day: 'Wed', collected: 480, transported: 475, discrepancies: 5 },
  { day: 'Thu', collected: 510, transported: 500, discrepancies: 10 },
  { day: 'Fri', collected: 490, transported: 485, discrepancies: 5 },
  { day: 'Sat', collected: 530, transported: 515, discrepancies: 15 },
  { day: 'Sun', collected: 470, transported: 460, discrepancies: 10 }
];

export const ActivityChart = () => {
  return (
    <Card className="glass-card p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Weekly Activity Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(260 40% 30%)" />
          <XAxis dataKey="day" stroke="hsl(280 30% 95%)" tick={{ fill: 'hsl(280 20% 65%)' }} />
          <YAxis stroke="hsl(280 30% 95%)" tick={{ fill: 'hsl(280 20% 65%)' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(265 50% 18%)',
              border: '1px solid hsl(260 40% 30%)',
              borderRadius: '0.5rem',
              color: 'hsl(280 30% 95%)'
            }}
          />
          <Legend wrapperStyle={{ color: 'hsl(280 30% 95%)' }} />
          <Bar dataKey="collected" fill="hsl(259 88% 65%)" name="Collected (L)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="transported" fill="hsl(165 95% 44%)" name="Transported (L)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="discrepancies" fill="hsl(0 72% 51%)" name="Discrepancies (L)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ActivityChart;

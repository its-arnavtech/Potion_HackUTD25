import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Clock, Calendar } from 'lucide-react';
import { backgroundData } from '@/data/backgroundData';
import { generateHistoricalData } from '@/utils/mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function HistoricalPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedCauldrons, setSelectedCauldrons] = useState(['cauldron_001', 'cauldron_002', 'cauldron_003', 'cauldron_004']);

  useEffect(() => {
    // Generate 7 days of historical data for all cauldrons
    const data = generateHistoricalData(7);
    setHistoricalData(data);
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= historicalData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, historicalData.length]);

  const currentData = historicalData.slice(0, currentTime + 1);
  const currentDate = historicalData[currentTime]?.timestamp || '';

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  const skipBackward = () => setCurrentTime(Math.max(0, currentTime - 10));
  const skipForward = () => setCurrentTime(Math.min(historicalData.length - 1, currentTime + 10));
  const restart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Color palette for all 12 cauldrons
  const cauldronColors = {
    cauldron_001: 'hsl(259, 88%, 65%)',    // Vibrant purple
    cauldron_002: 'hsl(165, 95%, 44%)',    // Cyan
    cauldron_003: 'hsl(280, 65%, 60%)',    // Lavender
    cauldron_004: 'hsl(142, 76%, 50%)',    // Green
    cauldron_005: 'hsl(320, 75%, 60%)',    // Pink
    cauldron_006: 'hsl(200, 70%, 55%)',    // Sky blue
    cauldron_007: 'hsl(0, 72%, 51%)',      // Red
    cauldron_008: 'hsl(38, 92%, 50%)',     // Orange
    cauldron_009: 'hsl(45, 100%, 51%)',    // Yellow
    cauldron_010: 'hsl(180, 95%, 44%)',    // Teal
    cauldron_011: 'hsl(270, 60%, 50%)',    // Deep purple
    cauldron_012: 'hsl(350, 85%, 60%)'     // Rose
  };

  const toggleCauldron = (cauldronId) => {
    setSelectedCauldrons(prev =>
      prev.includes(cauldronId)
        ? prev.filter(id => id !== cauldronId)
        : [...prev, cauldronId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            Historical Playback
          </h1>
          <p className="text-muted-foreground text-lg">Review past potion flow and collection events</p>
        </div>

        {/* Playback Controls */}
        <Card className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{currentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Speed:</span>
              <div className="flex gap-1">
                {[0.5, 1, 2, 4].map(speed => (
                  <Button
                    key={speed}
                    size="sm"
                    variant={playbackSpeed === speed ? 'default' : 'outline'}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={playbackSpeed === speed ? 'bg-primary text-primary-foreground' : ''}
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Slider
              value={[currentTime]}
              onValueChange={(value) => setCurrentTime(value[0])}
              max={historicalData.length - 1}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Start</span>
              <span>{Math.round((currentTime / historicalData.length) * 100)}%</span>
              <span>End</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={restart} className="glass-card">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={skipBackward} className="glass-card">
              -10s
            </Button>
            <Button
              onClick={togglePlayPause}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button variant="outline" onClick={skipForward} className="glass-card">
              +10s
            </Button>
            <Button variant="outline" onClick={() => setCurrentTime(historicalData.length - 1)} className="glass-card">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Historical Chart */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Potion Levels Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(260 40% 30%)" />
              <XAxis
                dataKey="timestamp"
                stroke="hsl(280 30% 95%)"
                tick={{ fill: 'hsl(280 20% 65%)' }}
              />
              <YAxis
                stroke="hsl(280 30% 95%)"
                tick={{ fill: 'hsl(280 20% 65%)' }}
                label={{ value: 'Volume (L)', angle: -90, position: 'insideLeft', fill: 'hsl(280 20% 65%)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(265 50% 18%)',
                  border: '1px solid hsl(260 40% 30%)',
                  borderRadius: '0.5rem',
                  color: 'hsl(280 30% 95%)'
                }}
              />
              <Legend wrapperStyle={{ color: 'hsl(280 30% 95%)' }} />
              {selectedCauldrons.map(cauldronId => (
                <Line
                  key={cauldronId}
                  type="monotone"
                  dataKey={cauldronId}
                  stroke={cauldronColors[cauldronId] || 'hsl(259 88% 65%)'}
                  strokeWidth={2}
                  dot={false}
                  name={backgroundData.cauldrons.find(c => c.id === cauldronId)?.name || cauldronId}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Cauldron Selection */}
        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Select Cauldrons to Display ({selectedCauldrons.length}/12)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {backgroundData.cauldrons.map(cauldron => {
              const isSelected = selectedCauldrons.includes(cauldron.id);
              const color = cauldronColors[cauldron.id];
              
              return (
                <Button
                  key={cauldron.id}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => toggleCauldron(cauldron.id)}
                  className={isSelected ? 'text-white' : 'glass-card'}
                  style={isSelected ? {
                    backgroundColor: color,
                    borderColor: color
                  } : {}}
                >
                  <span className="text-xs truncate">{cauldron.name.split(' ')[0]}</span>
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Click to toggle cauldron visibility on the chart</p>
        </Card>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { AlertCircle, TrendingUp, Calendar, Droplet } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [cauldrons, setCauldrons] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCauldron, setSelectedCauldron] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [levelData, setLevelData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCauldron) {
      fetchLevelData(selectedCauldron);
    }
  }, [selectedCauldron]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cauldronRes, discrepancyRes, statsRes] = await Promise.all([
        axios.get(`${API}/cauldrons`),
        axios.get(`${API}/discrepancies?suspicious_only=true`),
        axios.get(`${API}/stats/daily`)
      ]);

      setCauldrons(cauldronRes.data);
      setDiscrepancies(discrepancyRes.data);
      setDailyStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevelData = async (cauldronId) => {
    try {
      const response = await axios.get(`${API}/levels`, {
        params: { cauldron_id: cauldronId, limit: 1000 }
      });
      
      // Sample data every 60 minutes for visualization
      const sampled = response.data.filter((_, idx) => idx % 60 === 0);
      const formatted = sampled.map(item => ({
        time: new Date(item.timestamp).toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit' 
        }),
        level: item.level
      }));
      
      setLevelData(formatted);
    } catch (error) {
      console.error('Error fetching level data:', error);
    }
  };

  const runAIAnalysis = async () => {
    try {
      setAiAnalysis({ loading: true });
      const response = await axios.post(`${API}/ai-analyze`, {});
      setAiAnalysis(response.data);
    } catch (error) {
      console.error('Error running AI analysis:', error);
      setAiAnalysis({ 
        error: 'Failed to analyze. Please try again.',
        analysis: '',
        suspicious_patterns: [],
        recommendations: [],
        actions_taken: [],
        fixed_count: 0,
        flagged_couriers: []
      });
    }
  };

  const getCauldronStatus = (cauldron) => {
    const suspicious = discrepancies.filter(d => d.cauldron_id === cauldron.cauldron_id);
    if (suspicious.length > 0) return 'suspicious';
    if (!cauldron.current_level) return 'inactive';
    if (cauldron.current_level > 800) return 'high';
    if (cauldron.current_level < 100) return 'low';
    return 'normal';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'suspicious': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      case 'normal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Potion Factory Data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Droplet className="w-10 h-10 text-purple-300" />
          Poyo's Potion Factory Monitoring
        </h1>
        <p className="text-purple-200">Real-time cauldron tracking & discrepancy detection</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Total Cauldrons</p>
              <p className="text-3xl font-bold text-white">{cauldrons.length}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-full">
              <Droplet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Suspicious Tickets</p>
              <p className="text-3xl font-bold text-red-400">{discrepancies.length}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Total Collections</p>
              <p className="text-3xl font-bold text-white">
                {dailyStats.reduce((sum, s) => sum + s.total_collected, 0).toFixed(0)}L
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Monitoring Days</p>
              <p className="text-3xl font-bold text-white">{dailyStats.length}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Cauldron Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Cauldron Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cauldrons.map((cauldron) => {
            const status = getCauldronStatus(cauldron);
            const statusColor = getStatusColor(status);
            
            return (
              <div
                key={cauldron.cauldron_id}
                onClick={() => setSelectedCauldron(cauldron.cauldron_id)}
                className={`bg-white/10 backdrop-blur-md rounded-lg p-4 border-2 cursor-pointer transition-all hover:scale-105 ${
                  selectedCauldron === cauldron.cauldron_id 
                    ? 'border-purple-400 shadow-lg shadow-purple-500/50' 
                    : 'border-white/20'
                }`}
                data-testid={`cauldron-card-${cauldron.cauldron_id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">
                    {cauldron.cauldron_id.replace('cauldron_', 'C')}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${statusColor}`} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {cauldron.current_level ? `${cauldron.current_level.toFixed(0)}L` : 'N/A'}
                </div>
                <div className="text-xs text-purple-200">
                  {cauldron.total_tickets} tickets
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level Chart */}
      {selectedCauldron && levelData.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {selectedCauldron.replace('_', ' ')} - Level History
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={levelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#fff" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#fff" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #6366f1' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="level" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily Stats Chart */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Daily Collection Statistics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #6366f1' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="total_collected" fill="#8b5cf6" name="Total Collected (L)" />
            <Bar dataKey="suspicious_count" fill="#ef4444" name="Suspicious Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Discrepancies Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-400" />
          Suspicious Discrepancies
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-purple-200 font-semibold">Cauldron</th>
                <th className="text-left py-3 px-4 text-purple-200 font-semibold">Date</th>
                <th className="text-right py-3 px-4 text-purple-200 font-semibold">Reported</th>
                <th className="text-right py-3 px-4 text-purple-200 font-semibold">Expected</th>
                <th className="text-right py-3 px-4 text-purple-200 font-semibold">Difference</th>
                <th className="text-left py-3 px-4 text-purple-200 font-semibold">Couriers</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.slice(0, 20).map((disc, idx) => (
                <tr 
                  key={idx} 
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  data-testid={`discrepancy-row-${idx}`}
                >
                  <td className="py-3 px-4 text-white font-medium">
                    {disc.cauldron_id.replace('cauldron_', 'C')}
                  </td>
                  <td className="py-3 px-4 text-white">{disc.date}</td>
                  <td className="py-3 px-4 text-right text-white">{disc.reported_amount}L</td>
                  <td className="py-3 px-4 text-right text-white">{disc.expected_drain}L</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-bold ${
                      disc.difference > 0 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {disc.difference > 0 ? '+' : ''}{disc.difference}L ({disc.difference_percentage}%)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white text-xs">
                    {disc.tickets.map(t => t.courier_id.replace('courier_witch_', 'W')).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">AI Analysis</h2>
          <button
            onClick={runAIAnalysis}
            disabled={aiAnalysis?.loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            data-testid="ai-analyze-button"
          >
            {aiAnalysis?.loading ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
        </div>

        {aiAnalysis && !aiAnalysis.loading && (
          <div className="space-y-6">
            {/* Actions Taken Section */}
            {aiAnalysis.actions_taken && aiAnalysis.actions_taken.length > 0 && (
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-300 mb-3 flex items-center gap-2">
                  ✅ Agentic Actions Completed
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{aiAnalysis.fixed_count}</div>
                    <div className="text-sm text-green-200">Tickets Flagged</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400">{aiAnalysis.flagged_couriers?.length || 0}</div>
                    <div className="text-sm text-orange-200">Couriers Flagged</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{aiAnalysis.actions_taken.length}</div>
                    <div className="text-sm text-blue-200">Total Actions</div>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-green-200 mb-2">Actions Taken:</h4>
                  {aiAnalysis.actions_taken.slice(0, 10).map((action, idx) => (
                    <div key={idx} className="text-sm text-white bg-white/5 rounded p-2">
                      {action.action === 'flagged_ticket' && (
                        <span>🎫 Flagged ticket <strong>{action.ticket_id}</strong> - {action.reason}</span>
                      )}
                      {action.action === 'flagged_courier' && (
                        <span>👤 Flagged courier <strong>{action.courier_id}</strong> - {action.suspicious_count} suspicious tickets (status: {action.status})</span>
                      )}
                      {action.action === 'created_correction' && (
                        <span>📝 Created correction for <strong>{action.cauldron_id}</strong> on {action.date} - Original: {action.original}L → Corrected: {action.corrected}L</span>
                      )}
                    </div>
                  ))}
                  {aiAnalysis.actions_taken.length > 10 && (
                    <div className="text-xs text-green-200 text-center mt-2">
                      ... and {aiAnalysis.actions_taken.length - 10} more actions
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-purple-200 mb-2">Analysis</h3>
              <p className="text-white whitespace-pre-wrap">{aiAnalysis.analysis}</p>
            </div>

            {aiAnalysis.suspicious_patterns && aiAnalysis.suspicious_patterns.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-purple-200 mb-2">Patterns Detected</h3>
                <ul className="list-disc list-inside text-white space-y-1">
                  {aiAnalysis.suspicious_patterns.map((pattern, idx) => (
                    <li key={idx}>{pattern}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-purple-200 mb-2">Recommendations</h3>
                <ul className="list-disc list-inside text-white space-y-1">
                  {aiAnalysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!aiAnalysis && (
          <p className="text-purple-200">
            Click "Run AI Analysis" to get insights from NVIDIA Nemotron Nano 9B V2
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

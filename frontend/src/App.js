import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import NetworkMap from '@/pages/NetworkMap';
import DiscrepancyAnalyzer from '@/pages/DiscrepancyAnalyzer';
import HistoricalPlayback from '@/pages/HistoricalPlayback';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

function App() {
  return (
    <div className="App min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<NetworkMap />} />
          <Route path="/discrepancies" element={<DiscrepancyAnalyzer />} />
          <Route path="/history" element={<HistoricalPlayback />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;

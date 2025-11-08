import { Link } from 'react-router-dom';
import { useState } from 'react';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    { label: 'Total Projects', value: '24', icon: '📦', change: '+12%' },
    { label: 'Active Users', value: '1,429', icon: '👥', change: '+8%' },
    { label: 'Completion Rate', value: '94%', icon: '✓', change: '+2%' },
    { label: 'Storage Used', value: '67GB', icon: '💾', change: '+15%' },
  ];

  const recentActivity = [
    { action: 'New project created', time: '2 min ago', status: 'success' },
    { action: 'Database updated', time: '15 min ago', status: 'success' },
    { action: 'Backup completed', time: '1 hour ago', status: 'success' },
    { action: 'User logged in', time: '2 hours ago', status: 'info' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-sm border-r border-cyan-500/20 transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <span className="text-2xl">⭐</span>
            <span className="text-xl font-bold text-cyan-400">Potion</span>
          </div>
          <nav className="space-y-2">
            {[
              { icon: '📊', label: 'Dashboard', active: true },
              { icon: '📁', label: 'Projects', active: false },
              { icon: '👥', label: 'Team', active: false },
              { icon: '📈', label: 'Analytics', active: false },
              { icon: '⚙️', label: 'Settings', active: false },
            ].map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  item.active
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-6 border-t border-cyan-500/20">
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-cyan-500 text-black p-3 rounded-lg"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-cyan-500/10 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">Dashboard</h1>
                <p className="text-gray-400 mt-1">Welcome back, Space Cowboy</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  🔔
                </button>
                <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  👤
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-800/40 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                  <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 text-cyan-400">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-400' : 'bg-cyan-400'
                        }`}
                      />
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 text-cyan-400">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  { icon: '➕', label: 'New Project' },
                  { icon: '📤', label: 'Upload Files' },
                  { icon: '👥', label: 'Invite Team' },
                  { icon: '📊', label: 'View Reports' },
                ].map((action, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center space-x-3 p-4 bg-gray-900/50 hover:bg-cyan-500/10 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200"
                  >
                    <span className="text-2xl">{action.icon}</span>
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Overview */}
          <div className="mt-6 bg-gray-800/40 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 text-cyan-400">Active Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Stellar Navigation', progress: 85, status: 'On Track' },
                { name: 'Cosmic Database', progress: 60, status: 'In Progress' },
                { name: 'Galaxy Explorer', progress: 95, status: 'Near Complete' },
              ].map((project, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-900/50 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-colors"
                >
                  <h3 className="font-bold text-lg mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{project.status}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-cyan-400 mt-2 font-semibold">{project.progress}% Complete</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

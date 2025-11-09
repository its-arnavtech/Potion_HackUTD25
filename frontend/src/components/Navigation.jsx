import { NavLink } from 'react-router-dom';
import { Home, Map, AlertTriangle, Clock, Bot } from 'lucide-react';

export const Navigation = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/map', label: 'Network Map', icon: Map },
    { path: '/discrepancies', label: 'Discrepancies', icon: AlertTriangle },
    { path: '/history', label: 'History', icon: Clock },
    { path: '/ai-agent', label: 'AI Agent', icon: Bot }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Brew67Potions style */}
          <NavLink to="/" className="flex items-center gap-3 text-2xl font-bold group">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Brew67Potions
            </span>
          </NavLink>
          
          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 border border-transparent hover:border-primary/30'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm hidden lg:inline">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

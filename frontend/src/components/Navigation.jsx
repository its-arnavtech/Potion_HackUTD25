import { NavLink } from 'react-router-dom';
import { Home, Map, AlertTriangle, Clock, Sparkles } from 'lucide-react';

export const Navigation = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/map', label: 'Network Map', icon: Map },
    { path: '/discrepancies', label: 'Discrepancies', icon: AlertTriangle },
    { path: '/history', label: 'History', icon: Clock }
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-primary group-hover:animate-pulse" />
            <span className="text-xl font-bold text-foreground">Cauldron Network</span>
          </NavLink>
          
          <div className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground glow-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

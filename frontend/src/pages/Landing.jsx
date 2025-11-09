import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';

export default function Landing() {
  const [cauldrons] = useState([
    {
      name: "Mystic Green Brew",
      type: "Healing Potion",
      temperature: "98.2°C",
      concentration: "87.5%",
      viscosity: "Medium",
      potency: "94.1",
      status: "normal",
      color: "from-green-400 to-green-600"
    },
    {
      name: "Violet Essence",
      type: "Mana Potion",
      temperature: "75.8°C",
      concentration: "92.3%",
      viscosity: "High",
      potency: "88.7",
      status: "normal",
      color: "from-purple-400 to-purple-600"
    },
    {
      name: "Phoenix Fire",
      type: "Strength Elixir",
      temperature: "125.4°C",
      concentration: "78.9%",
      viscosity: "Low",
      potency: "96.3",
      status: "warning",
      color: "from-orange-400 to-orange-600"
    },
    {
      name: "Aqua Vitae",
      type: "Speed Boost",
      temperature: "65.2°C",
      concentration: "95.1%",
      viscosity: "Very Low",
      potency: "91.8",
      status: "normal",
      color: "from-blue-400 to-blue-600"
    },
    {
      name: "Golden Radiance",
      type: "Luck Potion",
      temperature: "88.7°C",
      concentration: "85.4%",
      viscosity: "Medium",
      potency: "89.2",
      status: "normal",
      color: "from-yellow-400 to-yellow-600"
    },
    {
      name: "Crimson Tide",
      type: "Rage Potion",
      temperature: "142.9°C",
      concentration: "68.2%",
      viscosity: "High",
      potency: "97.5",
      status: "critical",
      color: "from-red-400 to-red-600"
    },
    {
      name: "Emerald Dream",
      type: "Sleep Draught",
      temperature: "55.3°C",
      concentration: "91.7%",
      viscosity: "Medium",
      potency: "85.6",
      status: "normal",
      color: "from-emerald-400 to-emerald-600"
    },
    {
      name: "Sapphire Clarity",
      type: "Intelligence Boost",
      temperature: "70.1°C",
      concentration: "89.8%",
      viscosity: "Low",
      potency: "93.4",
      status: "normal",
      color: "from-indigo-400 to-indigo-600"
    }
  ]);

  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const getStatusClass = (status) => {
    switch(status) {
      case 'normal': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'critical': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0 animate-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-pulse-slow" />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Unified Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20 z-10">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-transparent">
              Intelligent Cauldron Monitoring
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
            AI-powered platform for real-time potion analysis, disturbance detection, and smart notifications
          </p>

          <Link 
            to="/dashboard"
            className="inline-block px-10 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/50"
          >
            Enter Dashboard
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6 z-10">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-5xl md:text-6xl font-extrabold text-center mb-20 tracking-tight">
            Powered by Advanced AI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "📊",
                title: "Real-Time Monitoring",
                description: "Track temperature, concentration, viscosity, and magical potency across all your potion batches with millisecond precision."
              },
              {
                icon: "🤖",
                title: "AI Chat Assistant",
                description: "Conversational AI that understands your potions, answers questions, and provides intelligent recommendations."
              },
              {
                icon: "🔔",
                title: "Smart Notifications",
                description: "Get alerted only when it matters. AI learns your preferences and filters out noise to deliver actionable insights."
              },
              {
                icon: "⚡",
                title: "Disturbance Detection",
                description: "Advanced algorithms identify anomalies, predict brewing issues, and suggest corrective actions before problems escalate."
              },
              {
                icon: "🎨",
                title: "Custom Dashboards",
                description: "AI automatically configures your workspace based on active issues, showing relevant data when you need it most."
              },
              {
                icon: "🔮",
                title: "Agentic Capabilities",
                description: "AI agents autonomously monitor, analyze, and even take corrective actions with your approval to maintain optimal conditions."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card p-8 rounded-2xl border border-border hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 group"
              >
                <div className="text-5xl mb-5">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="relative py-24 px-6 z-10">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-5xl md:text-6xl font-extrabold text-center mb-20 tracking-tight">
            Cauldron Command Center
          </h2>

          <div className="glass-card p-8 rounded-2xl border border-border">
            <div className="max-h-[700px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {cauldrons.map((cauldron, index) => (
                <div
                  key={index}
                  className="glass-card p-6 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 hover:translate-x-1 group"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {/* Cauldron Icon */}
                    <div className={`w-24 h-24 flex-shrink-0 rounded-lg bg-gradient-to-br ${cauldron.color} flex items-center justify-center text-4xl shadow-lg`}>
                      🧪
                    </div>

                    {/* Cauldron Info */}
                    <div className="flex-grow space-y-4 w-full">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusClass(cauldron.status)} animate-pulse shadow-lg`} />
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                            {cauldron.name}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          {cauldron.type}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                            Temperature
                          </p>
                          <p className="text-lg font-bold">{cauldron.temperature}</p>
                        </div>
                        <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                            Concentration
                          </p>
                          <p className="text-lg font-bold">{cauldron.concentration}</p>
                        </div>
                        <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                            Viscosity
                          </p>
                          <p className="text-lg font-bold">{cauldron.viscosity}</p>
                        </div>
                        <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                            Potency
                          </p>
                          <p className="text-lg font-bold">{cauldron.potency}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link 
              to="/dashboard"
              className="inline-block px-10 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/50"
            >
              Start Monitoring Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-20" />

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse 15s ease-in-out infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}

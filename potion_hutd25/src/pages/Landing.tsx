import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-black/20 backdrop-blur-sm border-b border-cyan-500/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-cyan-400">Potion</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
              <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
            </div>
            <Link
              to="/dashboard"
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8 flex justify-center space-x-4 text-4xl sm:text-6xl">
            <span className="animate-pulse">⭐</span>
            <span className="animate-pulse delay-75">✨</span>
            <span className="animate-pulse delay-150">🌟</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Welcome to Potion
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Saddle up, space cowboy. Your journey through the digital frontier begins here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/dashboard"
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/50 w-full sm:w-auto"
            >
              Launch Dashboard
            </Link>
            <button className="border-2 border-cyan-500 hover:bg-cyan-500/10 text-cyan-400 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 w-full sm:w-auto">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-cyan-950/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-cyan-400">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🚀', title: 'Lightning Fast', description: 'Blazing fast performance that keeps you moving at light speed' },
              { icon: '🌙', title: 'Dark Mode Native', description: 'Built for the night owls and space explorers' },
              { icon: '🎯', title: 'Precision Tools', description: 'Pinpoint accuracy for all your missions' },
              { icon: '🔒', title: 'Secure Vault', description: 'Your data protected like treasure in the cosmos' },
              { icon: '⚡', title: 'Real-time Sync', description: 'Stay connected across the galaxy' },
              { icon: '🌟', title: 'Premium Experience', description: 'A stellar interface that feels like home' },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/40 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-cyan-400">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-cyan-950/30 to-blue-950/30 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-6">Ready to Explore?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of space cowboys navigating the digital cosmos
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-10 py-4 rounded-lg text-lg transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/50"
          >
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 Potion. All rights reserved across the cosmos.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

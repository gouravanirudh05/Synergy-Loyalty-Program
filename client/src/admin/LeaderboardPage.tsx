import React from 'react';
import { Trophy, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  name: string;
  email: string;
  rollNumber: string;
  role: string;
}

interface LeaderboardPageProps {
  user: User;
  onLogout: () => void;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(`/${user.role}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 cyber-background">
      {/* Header */}
      <nav className="bg-gray-900/90 backdrop-blur-sm border-b border-cyan-400/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="cyber-nav-button p-2 rounded-md text-gray-300 hover:text-cyan-400"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                LOYALTY LEADERBOARD
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-cyan-400/20 rounded-full flex items-center justify-center">
                  <Trophy size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium truncate max-w-32 lg:max-w-48">
                    {user.email}
                  </p>
                  <p className="text-cyan-400 text-xs uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="bg-red-600/80 hover:bg-red-500 border border-red-500/50 hover:border-red-400 px-4 py-2 rounded-md text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="cyber-section-header mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-cyan-400 uppercase tracking-wider mb-2">
            Loyalty Program Leaderboard
          </h1>
          <p className="text-gray-400">Top performers in the loyalty program</p>
        </div>

        <div className="cyber-card p-6 md:p-8">
          <div className="text-center py-12">
            <Trophy className="mx-auto text-cyan-400 mb-4" size={64} />
            <h3 className="text-2xl font-semibold text-white mb-4">Leaderboard Coming Soon</h3>
            <p className="text-gray-400 mb-4 max-w-md mx-auto">
              The leaderboard feature is currently under development and will be available soon.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              This will show top participants based on their loyalty points and event participation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGoBack}
                className="cyber-button-secondary px-6 py-3 text-sm uppercase tracking-wider flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
              
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <TrendingUp size={16} />
                <span>Feature in development</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
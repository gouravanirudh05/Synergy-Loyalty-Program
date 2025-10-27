import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Star, Crown, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

export type Team = {
  _id: string;
  name: string;
  points: number;
  teamNumber: string;
};

const LeaderboardPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch teams data
  const fetchTeams = async () => {
    try {
      setLoading(true);
      // Fetch from the new /api/leaderboard/full endpoint
      const response = await apiService.getLeaderboardFull();
      setTeams(response.teams);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load leaderboard data');
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTeams();
  }, []);

  // Helper functions for icons and colors
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Trophy className="w-6 h-6 text-gray-300" />;
      case 3: return <Star className="w-6 h-6 text-amber-600" />;
      default: return <Zap className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "from-yellow-400/20 to-orange-500/20 border-yellow-400/50";
      case 2: return "from-gray-400/20 to-gray-600/20 border-gray-400/50";
      case 3: return "from-amber-600/20 to-yellow-700/20 border-amber-600/50";
      default: return "from-cyan-500/10 to-purple-500/10 border-cyan-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header section with Refresh button */}
        <div className="text-center mb-12 relative">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            LEADERBOARD
          </h1>
          <p className="text-xl text-cyan-300 font-mono tracking-wider mb-4">
            IIITB Loyalty Program • Live Rankings
          </p>
          
          {/* Refresh Button */}
          <button 
            onClick={fetchTeams}
            className="absolute right-4 top-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Teams list */}
        <div className="max-w-4xl mx-auto space-y-4">
          {teams.map((team, index) => {
            const rank = index + 1;
            
            return (
              <div key={team._id} className="relative">
                <div className={`relative backdrop-blur-sm bg-gray-900/80 border-2 ${getRankColor(rank)} rounded-xl p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        {getRankIcon(rank)}
                        <span className={`text-3xl font-bold ${rank <= 3 ? 'text-white' : 'text-cyan-400'}`}>
                          #{rank}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {team.name}
                        </h3>
                        <p className="text-gray-400 font-mono text-sm">
                          Team {team.teamNumber}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-cyan-400">
                        {team.points.toLocaleString()}
                      </div>
                      <p className="text-gray-500 text-sm font-mono">POINTS</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
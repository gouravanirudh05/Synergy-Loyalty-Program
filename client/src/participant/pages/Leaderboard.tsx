import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Award, ArrowLeft, Users } from "lucide-react";

interface LeaderboardTeam {
  rank: number;
  team_id: string;
  team_name: string;
  points: number;
  members_count: number;
}

const Leaderboard: React.FC = () => {
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leaderboard", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.leaderboard || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
      case 2:
        return "from-slate-400/20 to-slate-500/20 border-slate-400/50";
      case 3:
        return "from-amber-600/20 to-amber-700/20 border-amber-600/50";
      default:
        return "from-slate-800/20 to-slate-900/20 border-slate-700/50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg sm:text-2xl font-bold">
                <span className="text-cyan-400">SYNERGY</span>
                <span className="text-slate-400 ml-1 sm:ml-2">LEADERBOARD</span>
              </h1>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              TOP TEAMS
            </h2>
            <p className="text-slate-400 text-lg">
              Compete and climb to the top!
            </p>
          </div>

          {/* Podium for Top 3 */}
          {teams.length > 0 && (
            <div className="mb-8 flex items-end justify-center gap-4 px-4">
              {/* 2nd Place */}
              {teams[1] && (
                <div className="flex-1 max-w-[160px]">
                  <div className="bg-gradient-to-br from-slate-400/20 to-slate-500/20 border border-slate-400/50 rounded-t-2xl p-4 text-center">
                    <Medal className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-300 mb-1">2</div>
                    <div className="text-sm font-semibold text-white truncate mb-1">
                      {teams[1].team_name}
                    </div>
                    <div className="text-xl font-bold text-cyan-400">
                      {teams[1].points}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {teams[1].members_count} members
                    </div>
                  </div>
                  <div className="h-20 bg-gradient-to-b from-slate-400/30 to-slate-500/30 rounded-b-xl"></div>
                </div>
              )}

              {/* 1st Place */}
              {teams[0] && (
                <div className="flex-1 max-w-[180px]">
                  <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-t-2xl p-4 text-center relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-lg">👑</span>
                    </div>
                    <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2 mt-2" />
                    <div className="text-3xl font-bold text-yellow-400 mb-1">1</div>
                    <div className="text-sm font-semibold text-white truncate mb-1">
                      {teams[0].team_name}
                    </div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {teams[0].points}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {teams[0].members_count} members
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-b from-yellow-500/30 to-yellow-600/30 rounded-b-xl"></div>
                </div>
              )}

              {/* 3rd Place */}
              {teams[2] && (
                <div className="flex-1 max-w-[160px]">
                  <div className="bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-600/50 rounded-t-2xl p-4 text-center">
                    <Award className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-amber-600 mb-1">3</div>
                    <div className="text-sm font-semibold text-white truncate mb-1">
                      {teams[2].team_name}
                    </div>
                    <div className="text-xl font-bold text-cyan-400">
                      {teams[2].points}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {teams[2].members_count} members
                    </div>
                  </div>
                  <div className="h-16 bg-gradient-to-b from-amber-600/30 to-amber-700/30 rounded-b-xl"></div>
                </div>
              )}
            </div>
          )}

          {/* Full Leaderboard List */}
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.team_id}
                className={`bg-gradient-to-r ${getRankColor(
                  team.rank
                )} border rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {getRankIcon(team.rank) || (
                      <div className="text-xl font-bold text-slate-400">
                        {team.rank}
                      </div>
                    )}
                  </div>

                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg text-white truncate">
                      {team.team_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{team.members_count} members</span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-cyan-400">
                      {team.points}
                    </div>
                    <div className="text-xs text-slate-400">points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {teams.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                No teams on the leaderboard yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeamDashboard from "../components/TeamDashboard";
import TeamJoinCreate from "../components/TeamJoinCreate";
import ProfileDropdown from "../components/ProfileDropDown";
import { Users, TrendingUp } from "lucide-react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

interface Team {
  team_id: string;
  team_name: string;
  members: Array<{
    name: string;
    email: string;
    rollNumber: string;
    role: string;
  }>;
  points: number;
  events_participated: Array<any>;
  qr_id?: string;
  join_code?: string;
}

const ParticipantPortal: React.FC = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndTeam();
  }, []);

  const fetchUserAndTeam = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userResponse = await fetch(`${BACKEND_URL}/api/user/profile`, {
        credentials: "include",
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }

      // Fetch team
      const teamResponse = await fetch(`${BACKEND_URL}/api/my_team`, {
        credentials: "include",
      });

      if (teamResponse.ok) {
        const data = await teamResponse.json();
        setTeam(data.team);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeam(newTeam);
  };

  const handleTeamLeft = () => {
    setTeam(null);
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
            <h1 className="text-lg sm:text-2xl font-bold">
              <span className="text-cyan-400">SYNERGY</span>
              <span className="text-slate-400 ml-1 sm:ml-2">PARTICIPANT</span>
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Leaderboard Button */}
              <button
                onClick={() => navigate('/leaderboard')}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 group"
              >
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:text-cyan-300" />
                <span className="text-xs sm:text-sm font-medium text-slate-300 group-hover:text-white">
                  Leaderboard
                </span>
              </button>
              
              {/* Volunteer Mode Toggle (if applicable) */}
              {user && (user.role === "admin" || user.role === "volunteer") && (
                <button
                  onClick={() => navigate('/volunteer')}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 group"
                >
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:text-cyan-300" />
                  <span className="text-xs sm:text-sm font-medium text-slate-300 group-hover:text-white">
                    Volunteer
                  </span>
                </button>
              )}
              {/* Profile Dropdown */}
  {user && (
    <ProfileDropdown
      user={user}
      team={team}
      onLogout={() => {
        console.log("Logging out");
        navigate("/");
      }}
    />
  )}
              
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold">P</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-8">
        {!team ? (
          <TeamJoinCreate onTeamCreated={handleTeamCreated} />
        ) : (
          <TeamDashboard team={team} onTeamLeft={handleTeamLeft} />
        )}
      </div>
    </div>
  );
};

export default ParticipantPortal;
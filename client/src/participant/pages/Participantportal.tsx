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

      const userResponse = await fetch(`${BACKEND_URL}/api/user/profile`, {
        credentials: "include",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }

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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-10">
        <div className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 flex justify-between items-center gap-2 sm:gap-3">

          {/* Title */}
          <h1 className="text-base sm:text-xl md:text-2xl font-bold flex-shrink-0">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <span className="text-cyan-300 font-bold">SYNERGY</span>
              <span className="text-slate-400 font-light hidden xs:inline">PARTICIPANT</span>
            </div>
          </h1>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 ml-auto mr-2 sm:mr-0">

            {/* Leaderboard */}
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/30 hover:border-cyan-400/50 transition-all group"
              aria-label="Leaderboard"
            >
              <TrendingUp className="w-4 h-4 sm:w-4 sm:h-4 text-cyan-400 group-hover:text-cyan-300" />
              <span className="text-xs md:text-sm font-medium text-slate-300 group-hover:text-white hidden sm:inline">
                Leaderboard
              </span>
            </button>

            {/* Volunteer */}
            {user && (user.role === "admin" || user.role === "volunteer") && (
              <button
                onClick={() => navigate('/volunteer')}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/30 hover:border-cyan-400/50 transition-all group"
                aria-label="Volunteer"
              >
                <Users className="w-4 h-4 sm:w-4 sm:h-4 text-cyan-400 group-hover:text-cyan-300" />
                <span className="text-xs md:text-sm font-medium text-slate-300 group-hover:text-white hidden sm:inline">
                  Volunteer
                </span>
              </button>
            )}

            {/* Profile Dropdown */}
            {user && (
              <ProfileDropdown
                user={user}
                team={team}
                onLogout={() => navigate("/")}
              />
            )}

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-6 py-6 md:py-8">
        {!team ? (
          <TeamJoinCreate onTeamCreated={handleTeamCreated} />
        ) : (
          <TeamDashboard team={team} onTeamLeft={handleTeamLeft} />
        )}
      </main>

    </div>
  );
};

export default ParticipantPortal;

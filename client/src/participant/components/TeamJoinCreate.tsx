import React, { useState } from "react";
import { UserPlus, Users } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

interface TeamJoinCreateProps {
  onTeamCreated: (team: any) => void;
}

const TeamJoinCreate: React.FC<TeamJoinCreateProps> = ({ onTeamCreated }) => {
  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/create_team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team_name: teamName || undefined }),
      });

      const data = await response.json();
      if (response.ok) onTeamCreated(data.team);
      else setError(data.message || "Failed to create team");
    } catch (err) {
      console.error("Create team error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/join_team_by_code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ join_code: joinCode }),
      });

      const data = await response.json();
      if (response.ok) onTeamCreated(data.team);
      else setError(data.message || "Failed to join team");
    } catch (err) {
      console.error("Join team error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-['Orbitron'] min-h-[70vh]">
      {/* Selection Screen */}
      {mode === "select" && (
        <>
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
              GET STARTED
            </h2>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg">
              Create a new team or join an existing one
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Create Team Card */}
            <button
              onClick={() => setMode("create")}
              className="group bg-slate-900/70 border border-purple-500/20 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] text-left"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">
                Create Team
              </h3>
              <p className="text-slate-400 group-hover:text-slate-300 text-sm sm:text-base transition-colors">
                Start a new team and invite your friends using a unique code.
              </p>
            </button>

            {/* Join Team Card */}
            <button
              onClick={() => setMode("join")}
              className="group bg-slate-900/70 border border-purple-500/20 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-pink-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] text-left"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors">
                Join Team
              </h3>
              <p className="text-slate-400 group-hover:text-slate-300 text-sm sm:text-base transition-colors">
                Enter a team code to join an existing team.
              </p>
            </button>
          </div>
        </>
      )}

      {/* Create or Join Form */}
      {(mode === "create" || mode === "join") && (
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => {
              setMode("select");
              setError("");
            }}
            className="mb-6 text-slate-400 hover:text-cyan-300 transition-colors text-sm sm:text-base flex items-center gap-1"
          >
            ← Back
          </button>

          <div
            className={`bg-slate-900/70 border ${
              mode === "create"
                ? "border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                : "border-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
            } rounded-xl sm:rounded-2xl p-5 sm:p-8`}
          >
            <h2
              className={`text-2xl sm:text-3xl font-bold mb-6 text-transparent bg-clip-text ${
                mode === "create"
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                  : "bg-gradient-to-r from-purple-400 to-pink-500"
              }`}
            >
              {mode === "create" ? "Create New Team" : "Join Existing Team"}
            </h2>

            <form
              onSubmit={mode === "create" ? handleCreateTeam : handleJoinTeam}
              className="space-y-6"
            >
              {mode === "create" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white placeholder-slate-500 text-sm sm:text-base"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Team Join Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter team join code"
                    required
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-400 text-white placeholder-slate-500 text-sm sm:text-base"
                  />
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading || (mode === "join" && joinCode.trim().length === 0)
                }
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${
                  mode === "create"
                    ? "bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/30 text-cyan-300 hover:text-white"
                    : "bg-purple-500/20 border border-purple-400/40 hover:bg-purple-500/30 text-purple-300 hover:text-white"
                }`}
              >
                {loading
                  ? mode === "create"
                    ? "Creating..."
                    : "Joining..."
                  : mode === "create"
                  ? "Create Team"
                  : "Join Team"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamJoinCreate;

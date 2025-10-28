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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ team_name: teamName || undefined }),
      });

      const data = await response.json();

      if (response.ok) {
        onTeamCreated(data.team);
      } else {
        setError(data.message || "Failed to create team");
      }
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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ join_code: joinCode }),
      });

      const data = await response.json();

      if (response.ok) {
        onTeamCreated(data.team);
      } else {
        setError(data.message || "Failed to join team");
      }
    } catch (err) {
      console.error("Join team error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "select") {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            GET STARTED
          </h2>
          <p className="text-slate-400 text-lg">
            Create a new team or join an existing one
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Team Card */}
          <button
            onClick={() => setMode("create")}
            className="group bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 text-left"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">
              Create Team
            </h3>
            <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
              Start a new team and invite your friends to join using a unique code
            </p>
          </button>

          {/* Join Team Card */}
          <button
            onClick={() => setMode("join")}
            className="group bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 text-left"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-400 transition-colors">
              Join Team
            </h3>
            <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
              Enter a team code to join an existing team
            </p>
          </button>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => {
            setMode("select");
            setError("");
          }}
          className="mb-6 text-slate-400 hover:text-white transition-colors"
        >
          ← Back
        </button>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Create New Team
          </h2>

          <form onSubmit={handleCreateTeam} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Team Name (Optional)
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Leave empty for auto-generated name"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white placeholder-slate-500"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Team"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => {
            setMode("select");
            setError("");
          }}
          className="mb-6 text-slate-400 hover:text-white transition-colors"
        >
          ← Back
        </button>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Join Existing Team
          </h2>

          <form onSubmit={handleJoinTeam} className="space-y-6">
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
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-slate-500"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !joinCode}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Team"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default TeamJoinCreate;
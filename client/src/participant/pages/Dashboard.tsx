import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, LogOut, Users, Trophy, Check } from "lucide-react";

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

interface TeamDashboardProps {
  team: Team;
  onTeamLeft: () => void;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ team, onTeamLeft }) => {
  const [copied, setCopied] = useState<"qr" | "code" | null>(null);
  const [leaving, setLeaving] = useState(false);

  const handleCopy = (text: string, type: "qr" | "code") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLeaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team?")) return;

    setLeaving(true);
    try {
      const response = await fetch("/api/leave_team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team_id: team.team_id }),
      });

      const data = await response.json();

      if (response.ok) onTeamLeft();
      else alert(data.message || "Failed to leave team");
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-3xl sm:text-4xl font-bold mb-1 truncate bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {team.team_name}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">Team Dashboard</p>
        </div>
        <button
          onClick={handleLeaveTeam}
          disabled={leaving}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20
          border border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>{leaving ? "Leaving..." : "Leave Team"}</span>
        </button>
      </div>

      {/* QR + Info */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* QR Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM17 8h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            Team QR Code
          </h3>

          <div className="flex flex-col items-center flex-1">
            <div className="bg-white p-3 rounded-xl mb-3 w-[180px] sm:w-[220px]">
              <QRCodeSVG value={team.qr_id || team.team_id} width="100%" />
            </div>

            <p className="text-slate-400 text-sm mb-3 text-center">
              Show this QR code to volunteers at events
            </p>

            <button
              onClick={() => handleCopy(team.qr_id || team.team_id, "qr")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50
              border border-slate-700 rounded-lg transition-all duration-200"
            >
              {copied === "qr" ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy QR ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Points + Invite */}
        <div className="space-y-6">

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                Team Points
              </h3>
              <div className="text-3xl font-bold text-cyan-400">
                {team.points}
              </div>
            </div>
            <div className="text-slate-400 text-sm">
              Events participated: {team.events_participated.length}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              Invite Members
            </h3>

            <p className="text-slate-400 text-sm mb-3">
              Share this code (max 3 members)
            </p>

            <div className="flex gap-2 flex-col sm:flex-row">
              <div className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg font-mono text-lg text-cyan-400 overflow-x-auto whitespace-nowrap">
                {team.join_code || "N/A"}
              </div>

              <button
                onClick={() => handleCopy(team.join_code || "", "code")}
                className="px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-all duration-200 self-start sm:self-auto"
              >
                {copied === "code" ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Members */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          Team Members ({team.members.length}/3)
        </h3>

        <div className="space-y-3">
          {team.members.map((member, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{member.name}</div>
                <div className="text-sm text-slate-400 truncate">{member.rollNumber}</div>
              </div>

              {index === 0 && (
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded">
                  Leader
                </span>
              )}
            </div>
          ))}

          {team.members.length < 3 && (
            <div className="p-4 bg-slate-800/20 rounded-lg border border-dashed border-slate-700 text-center text-slate-500">
              {3 - team.members.length} slot{3 - team.members.length > 1 ? "s" : ""} available
            </div>
          )}
        </div>
      </div>

      {/* Events */}
      {team.events_participated.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Events Participated</h3>
          <div className="space-y-2">
            {team.events_participated.map((event: any, index: number) => (
              <div key={index} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 text-slate-300">
                {typeof event === "string" ? event : event.event || "Unknown Event"}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default TeamDashboard;

import { useState, useRef, useEffect } from "react";
import { User, LogOut, Users, Trophy, ChevronDown, Mail } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

interface Team {
  team_id: string;
  team_name: string;
  points: number;
  members: Array<{
    name: string;
    email: string;
    rollNumber: string;
  }>;
}

interface UserProfile {
  name: string;
  email: string;
  rollNumber: string;
  role: string;
}

interface ProfileDropdownProps {
  user: UserProfile;
  team?: Team | null;
  onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, team, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-pink-600/20 text-pink-400 border-pink-600/40";
      case "volunteer":
        return "bg-purple-600/20 text-purple-300 border-purple-600/40";
      default:
        return "bg-cyan-600/20 text-cyan-300 border-cyan-600/40";
    }
  };

  const getRoleLabel = (role: string) => role.charAt(0).toUpperCase() + role.slice(1);

  const handleLogoutClick = () => {
    setLoggingOut(true);
    window.location.href = `${BACKEND_URL}/api/logout`;
  };

  return (
    <div className="relative font-orbitron" ref={dropdownRef} style={{ fontFamily: "'Orbitron', sans-serif" }}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2a0a46]/60 hover:bg-[#3a0a6b]/70 border border-purple-700 text-purple-200 transition-all duration-200"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center">
          <span className="text-sm font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-semibold text-purple-100">{user.name}</div>
          <div className="text-xs text-purple-400">{getRoleLabel(user.role)}</div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-purple-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#1b052f]/95 border border-purple-800 rounded-xl shadow-[0_0_20px_rgba(130,50,255,0.3)] overflow-hidden z-50 backdrop-blur-md">
          {/* User Info */}
          <div className="p-4 bg-[#2b0a4a]/70 border-b border-purple-700">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-lg truncate">{user.name}</div>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadgeColor(user.role)} mt-1`}>
                  {getRoleLabel(user.role)}
                </div>
              </div>
            </div>
            <div className="text-sm text-purple-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>

          {/* Team Info */}
          {team ? (
            <div className="p-4 border-b border-purple-700">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white">Your Team</span>
              </div>
              <div className="bg-[#25083f]/60 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-purple-100">{team.team_name}</div>
                  <div className="flex items-center gap-1 text-cyan-300">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold">{team.points}</span>
                  </div>
                </div>
                <div className="text-xs text-purple-400">{team.members.length} member{team.members.length !== 1 ? "s" : ""}</div>
                <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
                  {team.members.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-purple-300 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                      <span className="flex-1 truncate">{member.name}</span>
                      {member.email === user.email && <span className="text-cyan-400 font-medium">(You)</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-purple-700">
              <div className="flex items-center gap-2 text-purple-400 text-sm">
                <Users className="w-4 h-4" />
                <span>Not in a team</span>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogoutClick}
            disabled={loggingOut}
            className="w-full p-4 flex items-center gap-3 text-pink-400 hover:bg-pink-600/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;

import { useState, useRef, useEffect } from "react";
import { User, LogOut, Users, Trophy, ChevronDown, Mail, Hash } from "lucide-react";

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "volunteer":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      default:
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50";
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleLogoutClick = () => {
  setLoggingOut(true);
  window.location.href = `${BACKEND_URL}/api/logout`;
};


  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-all duration-200"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <span className="text-sm font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-semibold text-white">{user.name}</div>
          <div className="text-xs text-slate-400">{getRoleLabel(user.role)}</div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          {/* User Info Section */}
          <div className="p-4 bg-slate-800/50 border-b border-slate-700">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-lg truncate">
                  {user.name}
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadgeColor(user.role)} mt-1`}>
                  {getRoleLabel(user.role)}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span>{user.rollNumber}</span>
              </div>
            </div>
          </div>

          {/* Team Info Section */}
          {team ? (
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white">Your Team</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">{team.team_name}</div>
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold">{team.points}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                </div>
                <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
                  {team.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-slate-400 py-1"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                      <span className="flex-1 truncate">{member.name}</span>
                      {member.rollNumber === user.rollNumber && (
                        <span className="text-cyan-400 font-medium">(You)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Users className="w-4 h-4" />
                <span>Not in a team</span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            disabled={loggingOut}
            className="w-full p-4 flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
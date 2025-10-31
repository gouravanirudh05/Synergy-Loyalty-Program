import React from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const FEST = import.meta.env.VITE_FEST_NAME;
  const YEAR = import.meta.env.VITE_YEAR;
  const BACKLINK = import.meta.env.VITE_BACK_LINK;

  const handleBackToFestLink = () => {
    window.location.href = BACKLINK;
  };

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden font-orbitron"
      style={{
        fontFamily: "'Orbitron', sans-serif",
        background: 'linear-gradient(135deg, #0f021f 0%, #180036 100%)',
      }}
    >
      {/* Soft glowing background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/15 blur-3xl rounded-full"></div>
      </div>

      {/* Cyber Grid Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,0,255,0.08) 1px, transparent 1px),
            linear-gradient(rgba(0,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      ></div>

      {/* Back Button */}
      <button
        onClick={handleBackToFestLink}
        className="absolute top-4 left-4 z-20 border border-purple-400 text-purple-300 hover:bg-purple-600/30 rounded-lg px-3 py-1.5 text-xs sm:text-sm uppercase tracking-wider transition-transform duration-300 hover:scale-105"
      >
        ← Back
      </button>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center w-full max-w-md sm:max-w-lg">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-3 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 drop-shadow-[0_0_12px_rgba(200,100,255,0.4)]">
              {FEST?.toUpperCase()}
            </h1>
            <h2 className="text-2xl sm:text-4xl text-cyan-300 mb-4 tracking-wide drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
              {YEAR}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base uppercase tracking-widest">
              Loyalty Programme Management System
            </p>
          </div>

          {/* Login Box */}
          <div className="bg-[#1b0730]/80 backdrop-blur-lg border border-purple-500/30 rounded-xl shadow-lg p-6 sm:p-8 mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-purple-300 uppercase tracking-widest mb-2">
              Secure Access Required
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 tracking-wide">
              Authenticate with your Microsoft account to continue
            </p>

            <button
              onClick={onLogin}
              className="w-full border border-cyan-400 text-cyan-300 hover:bg-cyan-400/20 hover:text-white font-semibold py-3 rounded-lg transition-all duration-300 uppercase tracking-widest text-sm sm:text-base"
            >
              Sign in with Microsoft
            </button>
          </div>
        </div>
      </div>

      {/* Corner highlights */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400"></div>
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-pink-400"></div>
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-purple-400"></div>
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400"></div>
    </div>
  );
};

export default Login;

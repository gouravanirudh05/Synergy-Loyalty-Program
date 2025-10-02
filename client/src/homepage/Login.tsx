import React from 'react';
import {ArrowLeft, Zap, Shield, Code } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Matrix Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="matrix-bg"></div>
        </div>
        
        {/* Cyber Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Back Button */}
      <button
        onClick={handleBackToFestLink}
        className="absolute top-6 left-6 z-20 cyber-button-secondary px-4 py-2 flex items-center gap-2 text-sm uppercase tracking-wider hover:scale-105 transition-all duration-300"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Back to {FEST.toUpperCase()}</span>
        <span className="sm:hidden">Back</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo and Title Section */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Shield className="text-cyan-400 animate-pulse" size={48} />
              <Code className="text-purple-400 animate-pulse delay-300" size={48} />
              <Zap className="text-orange-400 animate-pulse delay-700" size={48} />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 bg-clip-text text-transparent text-glow">
              {FEST.toUpperCase()} {YEAR}
            </h1>
            
            <div className="relative">
              <p className="text-gray-400 text-sm md:text-base tracking-wide">
                Loyalty Programme Management System
              </p>
              
              {/* Animated underline */}
              <div className="mt-4 mx-auto w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
            </div>
          </div>
          
          {/* Login Card */}
          <div className="cyber-modal max-w-md mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider mb-2">
                Secure Access Required
              </h3>
              <p className="text-gray-400 text-sm">
                Authenticate with your Microsoft account to continue
              </p>
            </div>
            
            <button
              onClick={onLogin}
              className="cyber-button-primary px-6 md:px-8 py-4 md:py-5 text-base md:text-lg font-bold uppercase tracking-wider flex items-center gap-3 mx-auto w-full justify-center hover:scale-105 transition-all duration-300 group"
            >
              <img src = {"/images/microsoft_logo.png"} className="group-hover:animate-pulse" width={24} />
              <span>Sign in with Microsoft</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Enhanced Corner Elements */}
      <div className="absolute top-4 left-4 w-12 h-12 md:w-20 md:h-20">
        <div className="w-full h-full border-t-2 border-l-2 border-cyan-400 animate-pulse"></div>
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
      </div>
      <div className="absolute top-4 right-4 w-12 h-12 md:w-20 md:h-20">
        <div className="w-full h-full border-t-2 border-r-2 border-orange-500 animate-pulse delay-500"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-ping delay-500"></div>
      </div>
      <div className="absolute bottom-4 left-4 w-12 h-12 md:w-20 md:h-20">
        <div className="w-full h-full border-b-2 border-l-2 border-purple-500 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 rounded-full animate-ping delay-1000"></div>
      </div>
      <div className="absolute bottom-4 right-4 w-12 h-12 md:w-20 md:h-20">
        <div className="w-full h-full border-b-2 border-r-2 border-cyan-400 animate-pulse delay-700"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping delay-700"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-200"></div>
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-1/3 left-2/3 w-1 h-1 bg-orange-400 rounded-full animate-ping delay-1200"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping delay-400"></div>
      </div>
    </div>
  );
};

export default Login;
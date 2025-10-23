import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './homepage/Login';
import AdminDashboard from './admin/AdminDashboard';
import VolunteerPortal from './volunteer/pages/VolunteerPortal';
import LeaderboardPage from './admin/LeaderboardPage';

//DUMMY STUFF REMOVE ONCE REST IS DONE

interface AdminDashboardProps {
  onLogout: () => void;
}
function VolunteerDashboard({ onLogout }: AdminDashboardProps){
  return <div>Volunteer Dashboard <button onClick={onLogout}>Logout</button></div>;
}

function ParticipantDashboard({ onLogout }: AdminDashboardProps){
  return <div>Participant Dashboard<button onClick={onLogout}>Logout</button></div>;
}

// ACTUAL CODE

interface User{
  name: string
  email: string
  rollNumber: string
  role:string
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = () => {
      window.location.href = `${BACKEND_URL}/api/login`;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/user/profile`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          data.rollNumber = data.name.split(' ')[0];
          data.name = data.name.split(' ').slice(1).join(' ');
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    setUser(null);
    window.location.href = `${BACKEND_URL}/api/logout`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p className="text-xl">Loading Session...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={!user ? <Login onLogin={handleLogin}/> : <Navigate to={`/${user.role}`} replace />} 
        />
        
        <Route 
          path="/admin" 
          element={user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/volunteer" 
          element={user && (user.role === 'volunteer' || user.role=='admin') ? <VolunteerPortal onLogout={handleLogout} /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/participant" 
          element={user && (user.role === 'participant' || user.role=='volunteer' || user.role=='admin') ? <ParticipantDashboard onLogout={handleLogout} /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/leaderboard" 
          element={user ? <LeaderboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="*"
          element={user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



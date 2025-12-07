import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import { UserRole } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check for session persistence on mount (Mock)
  useEffect(() => {
    // In a real app, this would check a token in localStorage or a cookie
    const savedUser = localStorage.getItem('gecko_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('gecko_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gecko_current_user');
  };

  // Used to force refresh data when switching views or updating
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      {!currentUser ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <div className="animate-fade-in">
          {currentUser.role === UserRole.TEACHER ? (
            <TeacherDashboard />
          ) : (
            <StudentDashboard user={currentUser} refreshTrigger={refreshTrigger} />
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;

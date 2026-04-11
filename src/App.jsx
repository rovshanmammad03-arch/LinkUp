import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import NewPostModal from './components/feed/NewPostModal';
import OnboardingModal from './components/onboarding/OnboardingModal';

function AppContent() {
    const { currentUser, loading } = useAuth();
    const [currentRoute, setCurrentRoute] = useState(() => {
        const saved = localStorage.getItem('currentRoute');
        if (saved) return saved;
        return currentUser ? 'dashboard' : 'landing';
    });
    const [routeParams, setRouteParams] = useState(() => {
        const saved = localStorage.getItem('routeParams');
        return saved ? JSON.parse(saved) : {};
    });
    const [history, setHistory] = useState([]);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const handleNavigate = (route, params = {}, clearHistory = false) => {
        if (clearHistory) {
            setHistory([]);
        } else if (route !== currentRoute || JSON.stringify(params) !== JSON.stringify(routeParams)) {
            setHistory(prev => [...prev, { route: currentRoute, params: routeParams }]);
        }

        setCurrentRoute(route);
        setRouteParams(params);
        localStorage.setItem('currentRoute', route);
        localStorage.setItem('routeParams', JSON.stringify(params));
    };

    const handleBack = () => {
        if (history.length === 0) return;
        
        const newHistory = [...history];
        const last = newHistory.pop();
        
        setHistory(newHistory);
        setCurrentRoute(last.route);
        setRouteParams(last.params);
        
        localStorage.setItem('currentRoute', last.route);
        localStorage.setItem('routeParams', JSON.stringify(last.params));
    };

    if (loading) return null;

    // Route logic
    const renderPage = () => {
        if (!currentUser && currentRoute !== 'login' && currentRoute !== 'register') {
            return <Landing onNavigate={handleNavigate} />;
        }

        switch (currentRoute) {
            case 'landing': return <Landing onNavigate={handleNavigate} />;
            case 'login': return <Login onNavigate={handleNavigate} />;
            case 'register': return <Register onNavigate={handleNavigate} onRegisterDone={() => setShowOnboarding(true)} />;
            case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
            case 'discover': return <Discover onNavigate={handleNavigate} />;
            case 'profile': return <Profile onNavigate={handleNavigate} params={routeParams} />;
            case 'messages': return <Messages onNavigate={handleNavigate} params={routeParams} />;
            case 'notifications': return <Notifications onNavigate={handleNavigate} />;
            case 'new-post': return (
                <>
                    <Dashboard onNavigate={handleNavigate} />
                    <NewPostModal 
                        onClose={() => handleNavigate('dashboard')} 
                        onPostCreated={() => {
                            handleNavigate('dashboard');
                            window.location.reload(); 
                        }} 
                    />
                </>
            );
            default: return <Landing onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar 
                onNavigate={handleNavigate} 
                currentRoute={currentRoute} 
                canGoBack={history.length > 0} 
                onBack={handleBack} 
            />
            <main className="pt-20 pb-24 md:pb-8">
                {renderPage()}
            </main>
            {showOnboarding && (
                <OnboardingModal onDone={() => {
                    setShowOnboarding(false);
                    handleNavigate('dashboard');
                }} />
            )}
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;

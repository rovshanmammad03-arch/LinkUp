import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import NewPostModal from './components/feed/NewPostModal';
import OnboardingModal from './components/onboarding/OnboardingModal';
import NewProject from './pages/NewProject';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';

// Əsas naviqasiya səhifələri — bunlarda geri düyməsi görünmür
const MAIN_ROUTES = ['dashboard', 'discover', 'messages', 'notifications', 'landing', 'login', 'register', 'forgot-password', 'verify-email'];

function AppContent() {
    const { currentUser, loading } = useAuth();
    
    // Qlobal profil məlumatlarını yüklə və yerli DB-yə əlavə et
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const { data, error } = await supabase.from('profiles').select('*');
                if (error) throw error;
                if (data && data.length > 0) {
                    const localUsers = JSON.parse(localStorage.getItem('lu_users')) || [];
                    const localUsersMap = new Map(localUsers.map(u => [u.id, u]));
                    
                    data.forEach(profile => {
                        localUsersMap.set(profile.id, { ...localUsersMap.get(profile.id), ...profile });
                    });
                    
                    localStorage.setItem('lu_users', JSON.stringify(Array.from(localUsersMap.values())));
                }
            } catch (err) {
                console.error("Profillər yüklənərkən xəta:", err);
            }
        };
        fetchProfiles();
    }, []);

    const [currentRoute, setCurrentRoute] = useState(() => {
        const saved = localStorage.getItem('currentRoute');
        if (saved) return saved;
        return currentUser ? 'dashboard' : 'landing';
    });
    const [routeParams, setRouteParams] = useState(() => {
        const saved = localStorage.getItem('routeParams');
        return saved ? JSON.parse(saved) : {};
    });
    const [prevRoute, setPrevRoute] = useState(null);
    const [prevParams, setPrevParams] = useState({});
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

    const handleNavigate = (route, params = {}, clearHistory = false) => {
        if (clearHistory) {
            setPrevRoute(null);
            setPrevParams({});
        } else if (route !== currentRoute || JSON.stringify(params) !== JSON.stringify(routeParams)) {
            // Yalnız əsas olmayan səhifədən gəlirsə prev saxla
            if (!MAIN_ROUTES.includes(currentRoute)) {
                setPrevRoute(currentRoute);
                setPrevParams(routeParams);
            } else if (!MAIN_ROUTES.includes(route)) {
                // Əsas səhifədən alt səhifəyə keçirsə prev saxla
                setPrevRoute(currentRoute);
                setPrevParams(routeParams);
            } else {
                // Əsas səhifədən əsas səhifəyə keçirsə prev sıfırla
                setPrevRoute(null);
                setPrevParams({});
            }
        }

        setCurrentRoute(route);
        setRouteParams(params);
        localStorage.setItem('currentRoute', route);
        localStorage.setItem('routeParams', JSON.stringify(params));
    };

    const handleBack = () => {
        if (!prevRoute) return;
        const backRoute = prevRoute;
        const backParams = prevParams;
        setPrevRoute(null);
        setPrevParams({});
        setCurrentRoute(backRoute);
        setRouteParams(backParams);
        localStorage.setItem('currentRoute', backRoute);
        localStorage.setItem('routeParams', JSON.stringify(backParams));
    };

    // Geri düyməsi yalnız alt səhifələrdə görünsün
    // Profile xüsusi hal: öz profilindəsə göstərmə, başqasının profilindəsə göstər
    const isOwnProfile = currentRoute === 'profile' && (!routeParams?.userId || routeParams?.userId === currentUser?.id);
    const canGoBack = !MAIN_ROUTES.includes(currentRoute) && !!prevRoute && !isOwnProfile;

    if (loading) return null;

    // Route logic
    const renderPage = () => {
        if (!currentUser && currentRoute !== 'login' && currentRoute !== 'register' && currentRoute !== 'forgot-password' && currentRoute !== 'verify-email') {
            return <Landing onNavigate={handleNavigate} />;
        }

        switch (currentRoute) {
            case 'landing': return <Landing onNavigate={handleNavigate} />;
            case 'login': return <Login onNavigate={handleNavigate} />;
            case 'register': return (
                <Register
                    onNavigate={handleNavigate}
                    onRegisterDone={() => {
                        setShowOnboarding(true);
                        handleNavigate('dashboard');
                    }}
                    onPendingVerification={(email) => handleNavigate('verify-email', { email })}
                />
            );
            case 'verify-email': return (
                <VerifyEmail
                    email={routeParams?.email || ''}
                    onVerified={() => {
                        setShowOnboarding(true);
                        handleNavigate('dashboard');
                    }}
                    onNavigate={handleNavigate}
                />
            );
            case 'dashboard': return <Dashboard key={dashboardRefreshKey} onNavigate={handleNavigate} />;
            case 'discover': return <Discover onNavigate={handleNavigate} />;
            case 'profile': return <Profile onNavigate={handleNavigate} params={routeParams} />;
            case 'messages': return <Messages onNavigate={handleNavigate} params={routeParams} />;
            case 'notifications': return <Notifications onNavigate={handleNavigate} />;
            case 'new-project': return <NewProject onNavigate={handleNavigate} params={routeParams} />;
            case 'forgot-password': return <ForgotPassword onNavigate={handleNavigate} />;
            case 'settings': return <Settings onNavigate={handleNavigate} />;
            case 'new-post': return (
                <>
                    <Dashboard key={dashboardRefreshKey} onNavigate={handleNavigate} />
                    <NewPostModal 
                        onClose={() => handleNavigate('dashboard')} 
                        onPostCreated={() => {
                            setDashboardRefreshKey(prev => prev + 1);
                            handleNavigate('dashboard');
                        }} 
                    />
                </>
            );
            default: return <Landing onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="min-h-screen" style={(!currentUser || currentRoute === 'landing') ? { background: '#050505' } : {}}>
            <Navbar 
                onNavigate={handleNavigate} 
                currentRoute={currentRoute} 
                canGoBack={canGoBack} 
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
        <AuthProvider>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;

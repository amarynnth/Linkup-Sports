import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import BottomNav from './components/BottomNav';
import NameGate from './components/NameGate';
import FriendGameToast from './components/FriendGameToast';
import UpdateWatcher from './components/UpdateWatcher';
import Feed from './pages/Feed';
import SessionDetail from './pages/SessionDetail';
import CreateSession from './pages/CreateSession';
import JoinByCode from './pages/JoinByCode';
import Friends from './pages/Friends';
import Notifications from './pages/Notifications';
import MyGames from './pages/MyGames';
import Profile from './pages/Profile';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1900);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-void">
      <UpdateWatcher />
      <NameGate>
        <FriendGameToast />
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/session/:id" element={<SessionDetail />} />
          <Route path="/create" element={<CreateSession />} />
          <Route path="/join" element={<JoinByCode />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/my-games" element={<MyGames />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomNav />
      </NameGate>
    </div>
  );
}

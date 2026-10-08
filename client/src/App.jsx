import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Live from './pages/Live';
import Category from './pages/Category';
import ArticleDetail from './pages/ArticleDetail';
import Search from './pages/Search';
import Saved from './pages/Saved';
import History from './pages/History';
import Preferences from './pages/Preferences';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Latest from './pages/Latest';
import Trending from './pages/Trending';
import ForYou from './pages/ForYou';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/live" element={<Live />} />
            <Route path="/latest" element={<Latest />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/for-you" element={<ForYou />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/category/:name" element={<Category />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/history" element={<History />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

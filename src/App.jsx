import { useEffect, useState } from 'react';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import CartDrawer from './components/CartDrawer';
import { Navigate, Route, Routes } from 'react-router-dom';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursesPage from './pages/CoursesPage';
import HomePage from './pages/HomePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import RecipeLibraryPage from './pages/RecipeLibraryPage';
import NewsletterPage from './pages/NewsletterPage';
import WpPageDetailPage from './pages/WpPageDetailPage';
import { useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setCartOpen(false);
  }, [location.pathname]);

  return (
    <div className="page">
      <SiteHeader onCartClick={() => setCartOpen(true)} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/recipe-library" element={<RecipeLibraryPage />} />
        <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/pages/:slug" element={<WpPageDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SiteFooter />
    </div>
  );
}

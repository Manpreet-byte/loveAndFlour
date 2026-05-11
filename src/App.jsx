import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
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

export default function App() {
  return (
    <div className="page">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/recipe-library" element={<RecipeLibraryPage />} />
        <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/pages/:slug" element={<WpPageDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}

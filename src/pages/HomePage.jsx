import HomeHero from '../components/sections/home/HomeHero';
import BakeryShowcaseSection from '../components/sections/home/BakeryShowcaseSection';
import CourseValueSection from '../components/sections/home/CourseValueSection';
import FeaturedCoursesSection from '../components/sections/home/FeaturedCoursesSection';
import FaqCtaSection from '../components/sections/home/FaqCtaSection';
import PathwaysSection from '../components/sections/home/PathwaysSection';
import RecipeHighlightsSection from '../components/sections/home/RecipeHighlightsSection';
import TestimonialsSection from '../components/sections/home/TestimonialsSection';
import NewsletterSection from '../components/sections/NewsletterSection';

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <BakeryShowcaseSection />
      <PathwaysSection />
      <CourseValueSection />
      <FeaturedCoursesSection />
      <RecipeHighlightsSection />
      <TestimonialsSection />
      <FaqCtaSection />
      <NewsletterSection />
    </main>
  );
}

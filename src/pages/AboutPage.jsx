import WpContentPage from '../components/WpContentPage';
import { pages } from '../data/seededContent';
import AboutSection from '../components/sections/AboutSection';

export default function AboutPage() {
  const page =
    pages.find((p) => p.slug === 'about') ??
    pages.find((p) => p.slug === 'about-us') ??
    pages.find((p) => p.slug === 'about-pooja') ??
    null;

  if (page) {
    return <WpContentPage badge="About" title={page.title} featuredImage={page.featuredImage} contentHtml={page.contentHtml} />;
  }

  return (
    <main>
      <AboutSection />
    </main>
  );
}

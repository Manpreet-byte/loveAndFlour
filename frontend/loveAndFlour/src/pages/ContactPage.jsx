import WpContentPage from '../components/WpContentPage';
import { pages } from '../data/seededContent';
import ContactSection from '../components/sections/ContactSection';
import NewsletterSection from '../components/sections/NewsletterSection';

export default function ContactPage() {
  const page = pages.find((p) => p.slug === 'contact') ?? pages.find((p) => p.slug === 'contact-us') ?? null;
  if (page) {
    return (
      <>
        <WpContentPage badge="Contact" title={page.title} featuredImage={page.featuredImage} contentHtml={page.contentHtml} />
        <NewsletterSection />
      </>
    );
  }
  return (
    <main>
      <ContactSection />
      <NewsletterSection />
    </main>
  );
}

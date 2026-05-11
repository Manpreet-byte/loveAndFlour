import rawCourses from './seed/courses.json';
import posts from './seed/posts.json';
import pages from './seed/pages.json';
import terms from './seed/terms.json';
import homeTestimonials from './seed/home-testimonials.json';

function parseInrPriceFromHtml(contentHtml) {
  const html = String(contentHtml ?? '');
  if (!html) return null;

  const patterns = [
    /Class Fee:\s*₹\s*([\d,]+)/i,
    /Event Fee:\s*₹\s*([\d,]+)/i,
    /Regular Price:\s*₹\s*([\d,]+)/i,
    /Price:\s*₹\s*([\d,]+)/i,
    /Fee:\s*₹\s*([\d,]+)/i,
  ];

  for (const re of patterns) {
    const match = html.match(re);
    const value = match?.[1]?.replace(/,/g, '') ?? '';
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) {
      return amount;
    }
  }

  return null;
}

export const courses = rawCourses.map((course) => {
  const priceInr = parseInrPriceFromHtml(course.contentHtml);
  return {
    ...course,
    priceInr,
    priceText: priceInr ? `₹${priceInr}` : '',
  };
});

export { posts, pages, terms, homeTestimonials };

export function findCourseBySlug(slug) {
  return courses.find((c) => c.slug === slug);
}

export function findPostBySlug(slug) {
  return posts.find((p) => p.slug === slug);
}

export function findPageBySlug(slug) {
  return pages.find((p) => p.slug === slug);
}

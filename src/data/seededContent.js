import courses from './seed/courses.json';
import posts from './seed/posts.json';
import pages from './seed/pages.json';
import terms from './seed/terms.json';
import homeTestimonials from './seed/home-testimonials.json';

export { courses, posts, pages, terms, homeTestimonials };

export function findCourseBySlug(slug) {
  return courses.find((c) => c.slug === slug);
}

export function findPostBySlug(slug) {
  return posts.find((p) => p.slug === slug);
}

export function findPageBySlug(slug) {
  return pages.find((p) => p.slug === slug);
}

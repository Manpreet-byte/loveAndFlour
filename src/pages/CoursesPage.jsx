import CourseCard from '../components/CourseCard';
import SectionHeading from '../components/SectionHeading';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courses, terms } from '../data/seededContent';

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  const filtered = useMemo(() => {
    if (!category) return courses;
    return courses.filter((c) => (c.taxonomies?.['course-category'] ?? []).some((t) => t.slug === category));
  }, [category]);

  const categoryName =
    category ? (terms.courseCategories ?? []).find((t) => t.slug === category)?.name ?? category : null;

  return (
    <main className="section">
      <div className="container">
        <SectionHeading
          badge="Online Workshops"
          title={categoryName ? `Courses: ${categoryName}` : 'All Courses'}
          subtitle={categoryName ? 'Browse workshops by format and category.' : 'Browse all workshops.'}
        />
        <div className="grid cards-grid">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </main>
  );
}

import CourseCard from '../components/CourseCard';
import SectionHeading from '../components/SectionHeading';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courses as seededCourses } from '../data/seededContent';
import { api } from '../api/client';
import { mergeBySlug, sortByDateDesc } from '../utils/publicContent';

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [courses, setCourses] = useState(seededCourses);

  useEffect(() => {
    let active = true;
    api.public.courses
      .list()
      .then((data) => {
        if (!active) return;
        setCourses(sortByDateDesc(mergeBySlug(data.courses ?? [], seededCourses)));
      })
      .catch(() => {
        if (active) setCourses(seededCourses);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!category) return courses;
    return courses.filter((c) => (c.taxonomies?.['course-category'] ?? []).some((t) => t.slug === category));
  }, [category]);

  const categoryName = category ? filtered.find((c) => (c.taxonomies?.['course-category'] ?? []).some((t) => t.slug === category))?.taxonomies?.['course-category']?.find((t) => t.slug === category)?.name ?? category : null;

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

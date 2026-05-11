import CourseCard from '../../CourseCard';
import SectionHeading from '../../SectionHeading';
import { courses } from '../../../data/seededContent';

export default function FeaturedCoursesSection() {
  const featured = courses
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <section className="section home-featured">
      <div className="container">
        <div className="home-featured-head">
          <SectionHeading
            badge="Top Products"
            title="Top Products"
            subtitle="A curated selection of workshops to start with."
          />
        </div>

        <div className="grid cards-grid">
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

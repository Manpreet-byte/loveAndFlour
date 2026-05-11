import { Link, useParams } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import { findCourseBySlug } from '../data/seededContent';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const course = findCourseBySlug(slug);

  if (!course) {
    return (
      <main className="section">
        <div className="container">
          <SectionHeading badge="Not Found" title="Course not found" subtitle="Try going back to all courses." />
          <Link className="button" to="/courses">
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <div className="page-topline">
          <Link className="button" to="/courses">
            ← All courses
          </Link>
          <a className="button button-solid" href={course.link} target="_blank" rel="noreferrer">
            View original site
          </a>
        </div>

        <SectionHeading align="left" badge="Course" title={course.title} subtitle={null} />

        {course.featuredImage ? (
          <div className="hero-image">
            <img src={course.featuredImage} alt={course.title} />
          </div>
        ) : null}

        {course.excerptHtml ? (
          <div className="panel prose-block" dangerouslySetInnerHTML={{ __html: course.excerptHtml }} />
        ) : null}

        {course.contentHtml ? (
          <div className="panel prose-block" dangerouslySetInnerHTML={{ __html: course.contentHtml }} />
        ) : null}
      </div>
    </main>
  );
}


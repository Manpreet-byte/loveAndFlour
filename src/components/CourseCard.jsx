import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
  return (
    <Link className="card course-card" to={`/courses/${course.slug}`}>
      <div className="course-card-media">
        {course.featuredImage ? (
          <img src={course.featuredImage} alt={course.title} loading="lazy" />
        ) : (
          <div className="course-card-fallback" aria-hidden="true" />
        )}
      </div>
      <div className="course-card-body">
        <h3 className="h3">{course.title}</h3>
        {course.excerptHtml ? (
          <p className="muted" dangerouslySetInnerHTML={{ __html: course.excerptHtml }} />
        ) : null}
      </div>
    </Link>
  );
}


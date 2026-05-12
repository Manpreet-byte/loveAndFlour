import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function CourseCard({ course }) {
  const addCourse = useCartStore((state) => state.addCourse);
  const hasCourse = useCartStore((state) => state.hasCourse(course.id));

  return (
    <article className="card course-card">
      <div className="course-card-media">
        {course.featuredImage ? (
          <img src={course.featuredImage} alt={course.title} loading="lazy" />
        ) : (
          <div className="course-card-fallback" aria-hidden="true" />
        )}
      </div>
      <div className="course-card-body">
        <Link className="course-card-link" to={`/courses/${course.slug}`}>
          <h3 className="h3">{course.title}</h3>
          {course.excerptHtml ? <p className="muted" dangerouslySetInnerHTML={{ __html: course.excerptHtml }} /> : null}
        </Link>
        {course.priceText ? (
          <div className="course-card-pricing">
            {course.compareAtPriceText ? <span className="course-card-original">{course.compareAtPriceText}</span> : null}
            <span className="course-card-price">{course.priceText}</span>
          </div>
        ) : null}
        <div className="course-card-footer">
          <div className="course-card-actions">
            <Link className="button button-ghost course-card-view" to={`/courses/${course.slug}`}>
              View details
            </Link>
            <button
              className="button button-solid course-card-add"
              type="button"
              onClick={() => addCourse(course)}
              disabled={hasCourse}
            >
              {hasCourse ? 'Added' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

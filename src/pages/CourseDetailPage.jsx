import { Link, useParams } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import { findCourseBySlug } from '../data/seededContent';
import { useCartStore } from '../store/cartStore';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const course = findCourseBySlug(slug);
  const addCourse = useCartStore((state) => state.addCourse);
  const removeCourse = useCartStore((state) => state.removeCourse);
  const inCart = useCartStore((state) => state.items.some((item) => item.id === course?.id));

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

        <div className="course-detail-actions">
          <button
            className="button button-solid"
            type="button"
            onClick={() => (inCart ? removeCourse(course.id) : addCourse(course))}
          >
            {inCart ? 'Remove from cart' : 'Add to cart'}
          </button>
          <p className="fineprint course-detail-cart-note">
            {inCart ? 'This workshop is already in your cart.' : 'Add it now and keep browsing the rest of the workshops.'}
          </p>
        </div>

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


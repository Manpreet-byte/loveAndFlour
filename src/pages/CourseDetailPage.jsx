import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { findCourseBySlug } from '../data/seededContent';
import { api } from '../api/client';
import { useCartStore } from '../store/cartStore';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(() => findCourseBySlug(slug));
  const addCourse = useCartStore((state) => state.addCourse);
  const removeCourse = useCartStore((state) => state.removeCourse);

  useEffect(() => {
    let active = true;
    setCourse(findCourseBySlug(slug));
    api.public.courses
      .detail(slug)
      .then((data) => {
        if (active) setCourse(data.course ?? findCourseBySlug(slug));
      })
      .catch(() => {
        if (active) setCourse(findCourseBySlug(slug));
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const inCart = useCartStore((state) => state.items.some((item) => item.id === course?.id));
  const categories = course?.taxonomies?.['course-category'] ?? [];

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
        </div>

        <div className="course-detail-grid">
          <div className="course-detail-main">
            <SectionHeading align="left" badge="Course" title={course.title} subtitle={null} />

            <div className="course-detail-meta">
              {categories.length ? (
                <div className="course-detail-badges" aria-label="Course categories">
                  {categories.map((c) => (
                    <span key={c.slug ?? c.id} className="pill">
                      {c.name}
                    </span>
                  ))}
                </div>
              ) : null}
              {course.date ? <div className="muted">Published {String(course.date).slice(0, 10)}</div> : null}
            </div>

            {course.featuredImage ? (
              <div className="course-hero">
                <img src={course.featuredImage} alt={course.title} loading="eager" />
              </div>
            ) : null}

            {course.excerptHtml ? (
              <div className="panel prose-block" dangerouslySetInnerHTML={{ __html: course.excerptHtml }} />
            ) : null}

            {course.contentHtml ? (
              <div className="panel prose-block" dangerouslySetInnerHTML={{ __html: course.contentHtml }} />
            ) : null}
          </div>

          <aside className="course-detail-aside" aria-label="Purchase">
            <div className="panel course-purchase-card">
              <div className="course-purchase-head">
                <div>
                  <div className="course-purchase-label">Workshop price</div>
                  {course.priceText ? (
                    <p className="course-detail-price">
                      {course.compareAtPriceText ? <span className="course-detail-original">{course.compareAtPriceText}</span> : null}
                      <span className="course-detail-current">{course.priceText}</span>
                    </p>
                  ) : (
                    <p className="course-detail-price">
                      <span className="course-detail-current">Contact for price</span>
                    </p>
                  )}
                </div>
                <span className="course-purchase-chip">{inCart ? 'In cart' : 'Ready to book'}</span>
              </div>

              <button
                className="button button-solid course-purchase-cta"
                type="button"
                onClick={() => (inCart ? removeCourse(course.id) : addCourse(course))}
              >
                {inCart ? 'Remove from cart' : 'Add to cart'}
              </button>

              <p className="fineprint course-detail-cart-note">
                {inCart ? 'This workshop is already in your cart.' : 'Add it now and continue browsing.'}
              </p>

              <div className="course-purchase-points" aria-label="What you get">
                <div className="course-purchase-point">
                  <span className="course-purchase-dot" aria-hidden="true" />
                  <span>Live session access + updates</span>
                </div>
                <div className="course-purchase-point">
                  <span className="course-purchase-dot" aria-hidden="true" />
                  <span>Recording link after the session</span>
                </div>
                <div className="course-purchase-point">
                  <span className="course-purchase-dot" aria-hidden="true" />
                  <span>Recording visible in dashboard for 1 year</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

import { useEffect, useMemo, useState } from 'react';
import SectionHeading from '../../SectionHeading';
import { homeTestimonials } from '../../../data/seededContent';

export default function TestimonialsSection() {
  const items = useMemo(() => (homeTestimonials ?? []).filter(Boolean).slice(0, 8), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2) {
      return undefined;
    }

    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      return undefined;
    }

    if (paused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [items.length, paused]);

  const total = items.length;
  const clampedIndex = total ? ((activeIndex % total) + total) % total : 0;

  return (
    <section className="section home-testimonials">
      <div className="container">
        <SectionHeading
          badge="Testimonials"
          title="What students say"
          subtitle="A few words from bakers who’ve attended workshops and recreated successfully."
        />

        <div
          className="testimonials-carousel"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="testimonials-viewport" aria-roledescription="carousel">
            <div className="testimonials-track" style={{ transform: `translateX(-${clampedIndex * 100}%)` }}>
              {items.map((t, index) => (
                <figure
                  key={t.id ?? index}
                  className="testimonial testimonial-slide"
                  aria-hidden={index !== clampedIndex}
                >
                  <blockquote>{t.quote}</blockquote>
                  <figcaption>
                    Student <span className="testimonial-count">{index + 1}</span>
                    <span className="muted">/ {total}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          {total > 1 ? (
            <div className="testimonials-controls">
              <button
                type="button"
                className="icon-button testimonials-nav"
                aria-label="Previous testimonial"
                onClick={() => setActiveIndex((current) => (current - 1 + total) % total)}
              >
                ‹
              </button>
              <div className="testimonials-dots" role="tablist" aria-label="Choose testimonial">
                {items.map((t, index) => (
                  <button
                    key={t.id ?? index}
                    type="button"
                    className={`testimonial-dot${index === clampedIndex ? ' is-active' : ''}`}
                    aria-label={`Testimonial ${index + 1}`}
                    aria-pressed={index === clampedIndex}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="icon-button testimonials-nav"
                aria-label="Next testimonial"
                onClick={() => setActiveIndex((current) => (current + 1) % total)}
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

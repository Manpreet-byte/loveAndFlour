import SectionHeading from '../../SectionHeading';
import { homeTestimonials } from '../../../data/seededContent';

export default function TestimonialsSection() {
  const items = (homeTestimonials ?? []).slice(0, 6);

  return (
    <section className="section home-testimonials">
      <div className="container">
        <SectionHeading
          badge="Testimonials"
          title="What students say"
          subtitle="A few words from bakers who’ve attended workshops and recreated successfully."
        />

        <div className="testimonials-grid">
          {items.map((t) => (
            <figure key={t.id} className="testimonial">
              <blockquote>{t.quote}</blockquote>
              <figcaption>Student</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}


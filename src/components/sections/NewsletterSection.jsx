import { useState } from 'react';
import SectionHeading from '../SectionHeading';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');

  return (
    <section id="newsletter" className="section section-newsletter">
      <div className="container">
        <SectionHeading
          badge="Newsletter"
          title="Get the Latest Recipes"
          subtitle="Join our community of baking enthusiasts and receive weekly recipes, exclusive tips, and special offers."
        />

        <form
          className="newsletter-form"
          onSubmit={(e) => {
            e.preventDefault();
            // eslint-disable-next-line no-alert
            alert('Thank you for subscribing!');
            setEmail('');
          }}
        >
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
          <button className="button button-solid" type="submit">
            Subscribe
          </button>
        </form>

        <p className="fineprint">No spam, unsubscribe anytime. We respect your privacy.</p>
      </div>
    </section>
  );
}


import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../SectionHeading';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  return (
    <section id="contact" className="section section-contact">
      <div className="container">
        <SectionHeading
          badge="Get in Touch"
          title="Contact Me"
          subtitle="Have a question about a recipe? Want to collaborate? I'd love to hear from you!"
        />

        <div className="contact-grid">
          <form
            className="panel contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              // eslint-disable-next-line no-alert
              alert("Thank you for your message! I'll get back to you soon.");
              setForm({ name: '', email: '', subject: '', message: '' });
            }}
          >
            <label className="field">
              <span>Your Name</span>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
                required
              />
            </label>

            <label className="field">
              <span>Email Address</span>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
                required
              />
            </label>

            <label className="field">
              <span>Subject</span>
              <input
                className="input"
                value={form.subject}
                onChange={(e) => setForm((v) => ({ ...v, subject: e.target.value }))}
                required
              />
            </label>

            <label className="field">
              <span>Message</span>
              <textarea
                className="input textarea"
                rows={6}
                value={form.message}
                onChange={(e) => setForm((v) => ({ ...v, message: e.target.value }))}
                required
              />
            </label>

            <button className="button button-solid" type="submit">
              Send Message
            </button>
          </form>

          <div className="contact-side">
            <div className="panel">
              <h3 className="h4">Email</h3>
              <p className="muted">hello@loveandflour.com</p>
            </div>
            <div className="panel">
              <h3 className="h4">Social Media</h3>
              <div className="contact-social">
                <a className="icon-button" href="#">
                  IG
                </a>
                <a className="icon-button" href="#">
                  FB
                </a>
                <a className="icon-button" href="#">
                  YT
                </a>
              </div>
            </div>
            <div className="panel panel-gradient">
              <h3 className="h4">Join the Community</h3>
              <p className="panel-gradient-text">
                Get weekly recipes, baking tips, and exclusive content delivered to your inbox.
              </p>
              <Link className="button button-ghost" to="/newsletter">
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

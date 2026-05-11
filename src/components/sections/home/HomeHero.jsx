import { Link } from 'react-router-dom';

export default function HomeHero() {
  return (
    <section className="hero-like">
      <div className="container hero-like-grid">
        <div className="hero-like-card" aria-label="Hero message">
          <div className="hero-like-card-inner">
            <h1 className="hero-like-title">
              MASTER THE ART OF
              <br />
              EGG-FREE BAKING.
              <br />
              FLOURISH.
            </h1>
            <p className="hero-like-text">
              Unlock your baking potential with curated, interactive, and technique-driven courses. Join our award-winning
              mentor to bake with confidence, precision, and passion.
            </p>
            <div className="hero-like-actions">
              <Link className="button button-solid hero-like-cta" to="/courses">
                ENROLL IN A WORKSHOP
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-like-visual" aria-label="Hero image">
          <div className="hero-like-collage">
            <div className="hero-like-blur" aria-hidden="true" />
            <div className="hero-like-frame">
              <img className="hero-like-frame-img" src="/seed-media/d6c70c1021c648ad8305bb295a9e900db12db52c.jpg" alt="Workshop preview" />
              <div className="hero-like-frame-badge">
                <img src="/brand/logo.png" alt="" aria-hidden="true" />
              </div>
            </div>
            <div className="hero-like-frame hero-like-frame-secondary" aria-hidden="true">
              <img
                className="hero-like-frame-img"
                src="/seed-media/f78b6b917cd1531e5d212e19cb80e9e1d8adeecc.jpg"
                alt=""
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

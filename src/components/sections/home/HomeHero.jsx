import { Link } from 'react-router-dom';

const heroImage = '/seed-media/d6c70c1021c648ad8305bb295a9e900db12db52c.jpg';

export default function HomeHero() {
  return (
    <section className="template-hero" aria-label="Hero">
      <div className="template-hero-media" aria-hidden="true">
        <img src={heroImage} alt="" loading="eager" />
      </div>
      <div className="container template-hero-inner">
        <p className="template-hero-eyebrow">Delicious Cafe</p>
        <h1 className="template-hero-title">
          Sweet Treats,
          <br />
          Perfect Eats
        </h1>
        <div className="template-hero-actions">
          <Link className="button button-solid template-hero-primary" to="/courses">
            Shop Now
          </Link>
          <Link className="template-hero-secondary" to="/recipe-library">
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

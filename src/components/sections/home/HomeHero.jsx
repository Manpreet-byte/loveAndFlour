import { Link } from 'react-router-dom';

const heroImage = '/hero.jpeg';

export default function HomeHero() {
  return (
    <section className="hero-premium" aria-label="Hero">
      <div className="hero-premium-media" aria-hidden="true">
        <img src={heroImage} alt="" loading="eager" />
      </div>
      <div className="hero-premium-overlay" />
      <div className="container hero-premium-inner">
        <div className="hero-premium-content">
          <p className="hero-premium-badge">Artisanal Bakery & Culinary Workshops</p>
          <h1 className="hero-premium-title">
            Craft Your
            <br />
            Culinary Story
          </h1>
          <p className="hero-premium-subtitle">
            Handcrafted recipes, live baking workshops, and premium ingredients<br />
            to elevate your home kitchen
          </p>
          <div className="hero-premium-actions">
            <Link className="button button-solid" to="/courses">
              Explore Workshops
            </Link>
            <Link className="button button-ghost" to="/recipe-library">
              Browse Recipes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

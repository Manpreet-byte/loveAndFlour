import { Link } from 'react-router-dom';

const heroPanels = [
  {
    src: '/seed-media/560ebdc890236b1a4092bda8547a446f67b42cc9.jpg',
    alt: 'Chocolate dessert bowl',
    copy: true,
  },
  {
    src: '/seed-media/d6c70c1021c648ad8305bb295a9e900db12db52c.jpg',
    alt: 'Workshop dessert preview',
  },
  {
    src: '/seed-media/f78b6b917cd1531e5d212e19cb80e9e1d8adeecc.jpg',
    alt: 'Layered dessert preview',
  },
];

export default function HomeHero() {
  return (
    <section className="hero-like hero-mosaic-hero">
      <div className="container hero-mosaic">
        {heroPanels.map((panel, index) => (
          <article key={panel.src} className={`hero-mosaic-panel hero-mosaic-panel-${index + 1}`} aria-label={`Hero panel ${index + 1}`}>
            <img className="hero-mosaic-image" src={panel.src} alt={panel.alt} loading={index === 0 ? 'eager' : 'lazy'} />
            <div className="hero-mosaic-scrim" aria-hidden="true" />
            {panel.copy ? (
              <div className="hero-mosaic-copy">
                <div className="hero-like-eyebrow hero-mosaic-eyebrow">Award-winning baking studio</div>
                <h1 className="hero-mosaic-title">
                  MASTER THE ART OF
                  <br />
                  EGG-FREE BAKING.
                  <br />
                  FLOURISH.
                </h1>
                <p className="hero-mosaic-text">
                  Unlock your baking potential with curated, interactive, and technique-driven workshops. Join our mentor to
                  bake with confidence, precision, and calm.
                </p>
                <div className="hero-mosaic-actions">
                  <Link className="button button-solid hero-like-cta" to="/courses">
                    ENROLL IN A WORKSHOP
                  </Link>
                </div>
                <div className="hero-mosaic-points" aria-label="Highlights">
                  <span>Live guidance</span>
                  <span>Elegant recipes</span>
                  <span>Hands-on techniques</span>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

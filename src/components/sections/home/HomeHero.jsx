import { Link } from 'react-router-dom';

const leftTall = {
  src: '/seed-media/560ebdc890236b1a4092bda8547a446f67b42cc9.jpg',
  alt: 'Dessert preview',
};

const rightTall = {
  src: '/seed-media/04e8ad20b052b70aa7f8d1e1b4ebf164f850de57.jpg',
  alt: 'Dessert box',
};

const centerHero = {
  src: '/seed-media/69795a40584d14892e2c89513205c6ddbd273185.png',
  alt: 'Love & Flour by Pooja',
};

const collageTiles = [
  {
    src: '/seed-media/d6c70c1021c648ad8305bb295a9e900db12db52c.jpg',
    alt: 'Cake and coffee',
  },
  {
    src: '/seed-media/073537b3ac56a54eb61e9b79382f0508510cf732.jpg',
    alt: 'Brownie box',
  },
  {
    src: '/seed-media/055b35f19448aa5f75771a90eb302f3ac30416c1.jpg',
    alt: 'Savoury bowl',
  },
  {
    src: '/seed-media/06157a97b219bb8ced716cc06d1c0f72f2d0b11d.jpg',
    alt: 'Fruit relish',
  },
];

export default function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-hero-banner">
        <div className="container home-hero-banner-inner">
          <h1 className="home-hero-title">MASTER THE ART OF EGG-FREE BAKURISH.</h1>
          <p className="home-hero-subtitle">
            Unlock your baking potential with curated, interactive, and technique-driven courses. Join our award-winning
            mentor for precision and calm.
          </p>
          <div className="home-hero-actions">
            <Link className="button button-solid home-hero-button" to="/courses">
              ENROLL IN A WORKSHOP
            </Link>
            <Link className="button button-solid home-hero-button" to="/courses">
              ENROLL IN A WORKSHOP
            </Link>
          </div>
        </div>
      </div>

      <div className="home-hero-collage" aria-label="Hero collage">
        <div className="home-hero-collage-inner">
          <div className="hero-collage-tall hero-collage-left">
            <img src={leftTall.src} alt={leftTall.alt} loading="eager" />
          </div>

          <div className="hero-collage-grid" aria-hidden="true">
            {collageTiles.map((tile) => (
              <img key={tile.src} src={tile.src} alt="" loading="lazy" />
            ))}
          </div>

          <div className="hero-collage-center">
            <img src={centerHero.src} alt={centerHero.alt} loading="eager" />
          </div>

          <div className="hero-collage-grid" aria-hidden="true">
            {collageTiles.map((tile) => (
              <img key={`right-${tile.src}`} src={tile.src} alt="" loading="lazy" />
            ))}
          </div>

          <div className="hero-collage-tall hero-collage-right" aria-hidden="true">
            <img src={rightTall.src} alt="" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}

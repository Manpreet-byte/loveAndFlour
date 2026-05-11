import SectionHeading from '../SectionHeading';

export default function AboutSection() {
  return (
    <section id="about" className="section section-about">
      <div className="container about-grid">
        <div>
          <SectionHeading
            align="left"
            badge="About Me"
            title="Meet Pooja"
            subtitle="Welcome to Love & Flour, where every recipe is crafted with passion and perfection."
          />
          <div className="prose">
            <p>
              What started as a hobby in my small kitchen has blossomed into a community of thousands of baking
              enthusiasts.
            </p>
            <p>
              From classic cookies to elaborate celebration cakes, each recipe is tested and perfected to ensure you get
              the best results every time.
            </p>
            <p>
              My philosophy is simple: baking should be joyful, not stressful. Whether you're a beginner or an
              experienced baker, you'll find clear instructions, helpful tips, and plenty of encouragement here.
            </p>
          </div>
        </div>

        <div className="about-media">
          <img
            src="https://images.unsplash.com/photo-1639583673176-e2499cad9835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Baking workspace"
            loading="lazy"
          />
          <div className="about-float">
            <p className="about-float-number">10K+</p>
            <p className="about-float-label">Happy Bakers</p>
          </div>
        </div>
      </div>

      <div className="container about-stats">
        <div className="stat-card">
          <div className="stat-icon">★</div>
          <h3 className="h3">162+ Recipes</h3>
          <p className="muted">Tested and perfected recipes for every occasion.</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">☻</div>
          <h3 className="h3">50K+ Community</h3>
          <p className="muted">Baking enthusiasts sharing their creations.</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❤</div>
          <h3 className="h3">100% Love</h3>
          <p className="muted">Every recipe made with care and attention.</p>
        </div>
      </div>
    </section>
  );
}


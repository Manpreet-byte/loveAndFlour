import { Link } from 'react-router-dom';
import RecipeCard from '../../RecipeCard';
import SectionHeading from '../../SectionHeading';
import { posts, terms } from '../../../data/seededContent';

export default function RecipeHighlightsSection() {
  const latest = posts
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
  const categories = (terms.postCategoriesUsed ?? []).slice(0, 8);

  return (
    <section className="section home-recipes">
      <div className="container">
        <div className="home-recipes-grid">
          <div>
            <SectionHeading
              badge="Recipe Library"
              title="Find your next bake"
              subtitle="Browse by category or jump into the latest recipe drops."
              align="left"
            />

            <div className="category-pills">
              <Link className="category-pill" to="/recipe-library">
                All Recipes
              </Link>
              {categories.map((c) => (
                <Link key={c.slug} className="category-pill" to={`/recipe-library?category=${encodeURIComponent(c.slug)}`}>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid cards-grid">
            {latest.map((post) => (
              <RecipeCard key={post.id} recipe={post} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


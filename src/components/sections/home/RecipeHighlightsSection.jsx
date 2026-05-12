import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../../RecipeCard';
import SectionHeading from '../../SectionHeading';
import { posts as seededPosts } from '../../../data/seededContent';
import { api } from '../../../api/client';
import { mergeBySlug, sortByDateDesc } from '../../../utils/publicContent';

export default function RecipeHighlightsSection() {
  const [latest, setLatest] = useState(seededPosts.slice(0, 6));

  useEffect(() => {
    let active = true;
    api.public.recipes
      .list()
      .then((data) => {
        if (!active) return;
        setLatest(sortByDateDesc(mergeBySlug(data.recipes ?? [], seededPosts)).slice(0, 6));
      })
      .catch(() => {
        if (active) setLatest(seededPosts.slice(0, 6));
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = Array.from(
    new Map(
      latest
        .flatMap((post) => post.taxonomies?.category ?? [])
        .map((category) => [category.slug, category]),
    ).values(),
  ).slice(0, 8);

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


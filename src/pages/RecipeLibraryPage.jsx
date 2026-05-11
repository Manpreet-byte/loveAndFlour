import RecipeCard from '../components/RecipeCard';
import SectionHeading from '../components/SectionHeading';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { posts, terms } from '../data/seededContent';

export default function RecipeLibraryPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  const filtered = useMemo(() => {
    if (!category) return posts;
    return posts.filter((p) => (p.taxonomies?.category ?? []).some((t) => t.slug === category));
  }, [category]);

  const categoryName =
    category ? (terms.postCategories ?? []).find((t) => t.slug === category)?.name ?? category : null;

  return (
    <main className="section">
      <div className="container">
        <SectionHeading
          badge="Recipe Library"
          title={categoryName ? `Recipes: ${categoryName}` : 'All Recipes'}
          subtitle={categoryName ? 'Browse recipes in this category.' : 'Browse the full recipe library.'}
        />
        <div className="grid cards-grid">
          {filtered.map((post) => (
            <RecipeCard key={post.id} recipe={post} />
          ))}
        </div>
      </div>
    </main>
  );
}

import RecipeCard from '../components/RecipeCard';
import SectionHeading from '../components/SectionHeading';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { posts as seededPosts } from '../data/seededContent';
import { api } from '../api/client';
import { mergeBySlug, sortByDateDesc } from '../utils/publicContent';

export default function RecipeLibraryPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [posts, setPosts] = useState(seededPosts);

  useEffect(() => {
    let active = true;
    api.public.recipes
      .list()
      .then((data) => {
        if (!active) return;
        setPosts(sortByDateDesc(mergeBySlug(data.recipes ?? [], seededPosts)));
      })
      .catch(() => {
        if (active) setPosts(seededPosts);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!category) return posts;
    return posts.filter((p) => (p.taxonomies?.category ?? []).some((t) => t.slug === category));
  }, [category]);

  const categoryName = category ? filtered.find((p) => (p.taxonomies?.category ?? []).some((t) => t.slug === category))?.taxonomies?.category?.find((t) => t.slug === category)?.name ?? category : null;

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

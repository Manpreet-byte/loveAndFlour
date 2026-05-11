import { Link } from 'react-router-dom';

export default function RecipeCard({ recipe, to }) {
  const href = to ?? `/recipes/${recipe.slug ?? recipe.id}`;
  const categoryName = recipe?.taxonomies?.category?.[0]?.name ?? 'Recipe';
  return (
    <Link className="card recipe-card" to={href}>
      <div className="recipe-card-media">
        {recipe.featuredImage ? (
          <img src={recipe.featuredImage} alt={recipe.title} loading="lazy" />
        ) : (
          <div className="recipe-card-fallback" aria-hidden="true" />
        )}
      </div>
      <div className="recipe-card-body">
        <div className="recipe-card-topline">
          <span className="pill">{categoryName}</span>
          <span className="muted">{new Date(recipe.date ?? Date.now()).toLocaleDateString()}</span>
        </div>
        <h3 className="h3">{recipe.title}</h3>
        {recipe.excerptHtml ? (
          <p className="muted" dangerouslySetInnerHTML={{ __html: recipe.excerptHtml }} />
        ) : null}
      </div>
    </Link>
  );
}

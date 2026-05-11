import { Link, useParams } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import { findPostBySlug } from '../data/seededContent';

export default function RecipeDetailPage() {
  const { slug } = useParams();
  const post = findPostBySlug(slug);

  if (!post) {
    return (
      <main className="section">
        <div className="container">
          <SectionHeading badge="Not Found" title="Recipe not found" subtitle="Try going back to the library." />
          <Link className="button" to="/recipe-library">
            Back to recipe library
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <div className="page-topline">
          <Link className="button" to="/recipe-library">
            ← Recipe library
          </Link>
          <a className="button button-solid" href={post.link} target="_blank" rel="noreferrer">
            View original site
          </a>
        </div>

        <SectionHeading
          align="left"
          badge={new Date(post.date ?? Date.now()).toLocaleDateString()}
          title={post.title}
          subtitle={null}
        />

        {post.featuredImage ? (
          <div className="hero-image">
            <img src={post.featuredImage} alt={post.title} />
          </div>
        ) : null}

        {post.contentHtml ? (
          <div className="panel prose-block" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        ) : null}
      </div>
    </main>
  );
}


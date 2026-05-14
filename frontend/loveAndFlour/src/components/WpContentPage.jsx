import { Link } from 'react-router-dom';
import SectionHeading from './SectionHeading';
import { sanitizeHtmlForApp } from '../utils/htmlSanitize';

export default function WpContentPage({ badge = 'Page', title, featuredImage, contentHtml, backTo, backLabel }) {
  const safeHtml = contentHtml ? sanitizeHtmlForApp(contentHtml) : '';
  return (
    <main className="section">
      <div className="container">
        {backTo ? (
          <div className="page-topline">
            <Link className="button" to={backTo}>
              ← {backLabel ?? 'Back'}
            </Link>
          </div>
        ) : null}

        <SectionHeading align="left" badge={badge} title={title} subtitle={null} />

        {featuredImage ? (
          <div className="hero-image">
            <img src={featuredImage} alt={title} />
          </div>
        ) : null}

        {safeHtml ? <div className="panel prose-block" dangerouslySetInnerHTML={{ __html: safeHtml }} /> : null}
      </div>
    </main>
  );
}

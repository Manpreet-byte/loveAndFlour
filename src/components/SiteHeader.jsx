import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { terms } from '../data/seededContent';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const courseCategoryOrder = [
  'upcoming-live-workshops',
  'upcoming-live-session',
  'recorded-live-workshop',
  'hands-on-classes',
  'e-book',
];

export default function SiteHeader({ onCartClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);
  const cartCount = useCartStore((state) => state.items.length);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.user?.role ?? '');

  const courseCategories = (terms?.courseCategories ?? [])
    .slice()
    .sort((a, b) => courseCategoryOrder.indexOf(a.slug) - courseCategoryOrder.indexOf(b.slug))
    .filter((t) => courseCategoryOrder.includes(t.slug));
  const recipeCategories = (terms?.postCategories ?? []).filter((t) => t.slug !== 'uncategorized');

  const courseHrefBySlug = useMemo(() => {
    const map = new Map();
    for (const cat of courseCategories) map.set(cat.slug, `/courses?category=${encodeURIComponent(cat.slug)}`);
    return map;
  }, [courseCategories]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }

    function onPointerDown(e) {
      if (!navRef.current) return;
      if (navRef.current.contains(e.target)) return;
      setOpenMenu(null);
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    setOpenMenu(null);
  }, [mobileOpen]);

  return (
    <header className="site-header">
      <div className="container header-inner" ref={navRef}>
        <button
          className="icon-button header-burger"
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span aria-hidden="true">{mobileOpen ? '×' : '≡'}</span>
        </button>

        <NavLink className="brand" to="/" onClick={() => setMobileOpen(false)}>
          <span className="brand-lockup">
            <img className="brand-logo" src="/brand/logo.png" alt="Love & Flour by Pooja" />
          </span>
        </NavLink>

        <nav className="header-nav" aria-label="Primary navigation">
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`} to="/" end>
            Home
          </NavLink>

          <div
            className={`nav-dropdown${openMenu === 'courses' ? ' is-open' : ''}`}
            onMouseEnter={() => setOpenMenu('courses')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              className="nav-link nav-link-button"
              type="button"
              aria-haspopup="menu"
              aria-expanded={openMenu === 'courses'}
              onClick={() => setOpenMenu((v) => (v === 'courses' ? null : 'courses'))}
            >
              Online Workshops <span className="nav-caret" aria-hidden="true">▾</span>
            </button>
            {openMenu === 'courses' ? (
              <div className="dropdown-panel" role="menu">
                <NavLink className="dropdown-link dropdown-link-strong" to="/courses" onClick={() => setOpenMenu(null)}>
                  Explore all
                </NavLink>
                {courseCategories.map((cat) => (
                  <NavLink
                    key={cat.slug}
                    className="dropdown-link"
                    to={courseHrefBySlug.get(cat.slug)}
                    onClick={() => setOpenMenu(null)}
                  >
                    {cat.name}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>

          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
            to="/courses?category=hands-on-classes"
          >
            Hands-On Classes
          </NavLink>

          <div
            className={`nav-dropdown${openMenu === 'recipes' ? ' is-open' : ''}`}
            onMouseEnter={() => setOpenMenu('recipes')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              className="nav-link nav-link-button"
              type="button"
              aria-haspopup="menu"
              aria-expanded={openMenu === 'recipes'}
              onClick={() => setOpenMenu((v) => (v === 'recipes' ? null : 'recipes'))}
            >
              Recipe Library <span className="nav-caret" aria-hidden="true">▾</span>
            </button>
            {openMenu === 'recipes' ? (
              <div className="dropdown-panel dropdown-panel-wide" role="menu">
                <NavLink className="dropdown-link dropdown-link-strong" to="/recipe-library" onClick={() => setOpenMenu(null)}>
                  All Recipes
                </NavLink>
                {recipeCategories.map((cat) => (
                  <NavLink
                    key={cat.slug}
                    className="dropdown-link"
                    to={`/recipe-library?category=${encodeURIComponent(cat.slug)}`}
                    onClick={() => setOpenMenu(null)}
                  >
                    {cat.name}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="header-actions">
          <button className="icon-button header-cart" type="button" onClick={onCartClick} aria-label={`Open cart (${cartCount})`}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path
                d="M6.5 6.5H21l-1.6 7.2a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.2 3.8H3"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.8 21a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm8.2 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"
                fill="currentColor"
              />
            </svg>
            {cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
          </button>
          {token ? (
            <>
              {role === 'admin' ? (
                <NavLink className="button button-solid header-cta" to="/admin/dashboard">
                  Admin
                </NavLink>
              ) : null}
              <NavLink className="button button-solid header-cta" to="/dashboard">
                Dashboard
              </NavLink>
              <NavLink className="button button-solid header-cta" to="/profile">
                Profile
              </NavLink>
              <button className="button button-solid header-cta" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink className="button button-solid header-cta" to="/login">
              Login
            </NavLink>
          )}
        </div>
      </div>

      {mobileOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <div className="container mobile-nav-inner">
            <NavLink className="mobile-nav-link" to="/" onClick={() => setMobileOpen(false)} end>
              Home
            </NavLink>
            <NavLink className="mobile-nav-link" to="/courses" onClick={() => setMobileOpen(false)}>
              Online Workshops
            </NavLink>
            {courseCategories.map((cat) => (
              <NavLink
                key={cat.slug}
                className="mobile-nav-link mobile-nav-sublink"
                to={`/courses?category=${encodeURIComponent(cat.slug)}`}
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </NavLink>
            ))}
            <NavLink
              className="mobile-nav-link"
              to="/courses?category=hands-on-classes"
              onClick={() => setMobileOpen(false)}
            >
              Hands-On Classes
            </NavLink>
            <NavLink className="mobile-nav-link" to="/recipe-library" onClick={() => setMobileOpen(false)}>
              Recipe Library
            </NavLink>
            <NavLink className="mobile-nav-link mobile-nav-sublink" to="/recipe-library" onClick={() => setMobileOpen(false)}>
              All Recipes
            </NavLink>
            {recipeCategories.map((cat) => (
              <NavLink
                key={cat.slug}
                className="mobile-nav-link mobile-nav-sublink"
                to={`/recipe-library?category=${encodeURIComponent(cat.slug)}`}
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </NavLink>
            ))}
            <NavLink className="mobile-nav-link" to="/newsletter" onClick={() => setMobileOpen(false)}>
              Newsletter
            </NavLink>
            <NavLink className="mobile-nav-link" to="/about" onClick={() => setMobileOpen(false)}>
              About
            </NavLink>
            <NavLink className="mobile-nav-link" to="/contact" onClick={() => setMobileOpen(false)}>
              Contact
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}

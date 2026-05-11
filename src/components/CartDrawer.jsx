import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function CartDrawer({ open, onClose }) {
  const items = useCartStore((state) => state.items);
  const removeCourse = useCartStore((state) => state.removeCourse);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="cart-drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Course cart"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-drawer-header">
          <div>
            <p className="section-kicker">Your cart</p>
            <h2 className="h3">Online workshops</h2>
          </div>
          <button className="icon-button cart-close" type="button" onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </div>

        {items.length ? (
          <>
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-media">
                    {item.featuredImage ? <img src={item.featuredImage} alt={item.title} /> : null}
                  </div>
                  <div className="cart-item-body">
                    <div className="cart-item-head">
                      <div>
                        <p className="cart-item-title">{item.title}</p>
                        <p className="cart-item-meta">Added to cart</p>
                      </div>
                      <button className="cart-remove" type="button" onClick={() => removeCourse(item.id)}>
                        Remove
                      </button>
                    </div>
                    {item.link ? (
                      <a className="cart-item-link" href={item.link} target="_blank" rel="noreferrer">
                        View original workshop
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-drawer-footer">
              <div className="cart-summary">
                <span>{items.length} workshop{items.length === 1 ? '' : 's'} selected</span>
                <button className="button button-ghost" type="button" onClick={clearCart}>
                  Clear cart
                </button>
              </div>
              <Link className="button button-solid cart-checkout" to="/contact" onClick={onClose}>
                Continue to contact
              </Link>
            </div>
          </>
        ) : (
          <div className="cart-empty">
            <p className="muted">Your cart is empty right now.</p>
            <Link className="button button-solid" to="/courses" onClick={onClose}>
              Browse workshops
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

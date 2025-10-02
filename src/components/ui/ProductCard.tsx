import { productService } from "@/services/productService";
import type { Product } from "@/types";
import { ImageWithPlaceholder } from "./ImageWithPlaceholder";
import { useNavigate } from "react-router-dom";

export const ProductCard = ({
  product,
  smallVariant,
}: {
  product: Product;
  smallVariant?: boolean;
}) => {
  const stockStatus = (() => {
    if (!product.in_stock) {
      return {
        text: 'Out of Stock',
        className: 'stock-status--out-of-stock',
        available: false
      };
    }
    
    if (product.can_do_bulk) {
      return {
        text: 'Available for Bulk Orders',
        className: 'stock-status--bulk',
        available: true
      };
    }
    
    return {
      text: `${product.stock_quantity} units available`,
      className: 'stock-status--in-stock',
      available: true
    };
  })();
  const discountPercentage = productService.calculateDiscountPercentage(
    product.actual_price,
    product.discounted_price
  );
  const navigate = useNavigate();
  return (
    <article
      className="product-card"
      style={{position: "relative"}}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="product-card__image-container" style={!stockStatus.available ? { opacity: 0.5 } : {}}>
        <ImageWithPlaceholder
          src={product.images[0] || "/default-candle.jpg"}
          alt={product.name}
          width="100%"
          placeholder="shimmer"
          priority={false}
          className="product-card__image"
          fallback="/default-candle-fallback.jpg"
        />

        {product.price_sets &&
          product.price_sets.length > 0 &&
          !smallVariant && (
            <div className="product-card__featured-badge">
              ✨ Upto{" "}
              {(
                ((product.price_sets[product.price_sets.length - 1]
                  .actual_price -
                  product.price_sets[product.price_sets.length - 1]
                    .discounted_price) /
                  product.price_sets[product.price_sets.length - 1]
                    .actual_price) *
                100
              ).toFixed()}{" "}
              % off in sets
            </div>
          )}
      </div>
      {!stockStatus.available && (
        <div className={`product-card__stock-badge ${stockStatus.className}`}>
          {"⚠️ Sold Out"}
        </div>
      )}
      <div className="product-card__content" style={{
        ...(smallVariant ? { padding: "0.75rem" } : {}),
        ...(!stockStatus.available ? { opacity: 0.5 } : {}),
      }}>
        <h3 className="product-card__title" style={smallVariant ? { fontSize: '1rem' } : {}}>{product.name}</h3>
        <p className="product-card__category" style={smallVariant ? { fontSize: '0.75rem' } : {}}>{product.category}</p>

        {/* Pricing Display */}
        {!smallVariant && (
          <div className="product-card__pricing">
            {discountPercentage > 0 ? (
              <>
                <span className="product-card__price-actual">
                  ₹{product.actual_price?.toFixed(0)}
                </span>
                <span className="product-card__price-discounted">
                  ₹{product.discounted_price?.toFixed(0)}
                </span>
                <span className="product-card__discount-percentage">
                  ({discountPercentage}% off)
                </span>
              </>
            ) : (
              <span className="product-card__price-single">
                ₹{product.discounted_price?.toFixed(0)}
              </span>
            )}
          </div>
        )}

        {/* Set Pricing Preview */}
        {/* {product.price_sets && product.price_sets.length > 0 && stockStatus.available && (
            <div className="product-card__sets">
              <h4>Set Discounts Available:</h4>
              <div className="product-card__sets-list">
                {product.price_sets.slice(0, 2).map((priceSet) => {
                  const setDiscount = productService.calculateDiscountPercentage(priceSet.actual_price, priceSet.discounted_price);
                  return (
                    <div key={priceSet.id} className="product-card__set-item">
                      <span className="set-quantity">Set of {priceSet.set_quantity}:</span>
                      <div className="set-pricing">
                        <span className="set-price-actual">₹{priceSet.actual_price?.toFixed(0)}</span>
                        <span className="set-price-discounted">₹{priceSet.discounted_price?.toFixed(0)}</span>
                        {setDiscount > 0 && (
                          <span className="set-discount">({setDiscount}% off)</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {product.price_sets.length > 2 && (
                  <span className="product-card__more-sets">
                    +{product.price_sets.length - 2} more sets available
                  </span>
                )}
              </div>
            </div>
          )} */}

        {/* <div className={`product-card__stock ${stockStatus.className}`}>
            {stockStatus.text}
          </div> */}

        {/* Bulk Order Message */}
        {/* {product.can_do_bulk && stockStatus.available && (
            <div className="product-card__bulk-message">
              <h4>📦 Bulk Orders</h4>
              <p>For bulk orders, reach out via:</p>
              <div className="product-card__contact-options">
                <a href="https://wa.me/+919038644125" target="_blank" rel="noopener noreferrer" className="contact-link whatsapp">
                  📱 WhatsApp
                </a>
                <a href="https://instagram.com/lavyaglow" target="_blank" rel="noopener noreferrer" className="contact-link instagram">
                  📷 Instagram
                </a>
              </div>
            </div>
          )} */}

        {/* {product.description && (
            <p className="product-card__description">
              {product.description.length > 100 
                ? `${product.description.substring(0, 100)}...` 
                : product.description
              }
            </p>
          )} */}
        {/* {product.characteristics && Object.keys(product.characteristics).length > 0 && (*/}
        {/* <div className="product-card__characteristics"> 
              {product.characteristics?.colors && (
                <div className="product-card__colors">
                  <ColorChips colors={product.characteristics.colors} />
                </div>
              )}
            </div> */}
        {/* )} */}
        {/* {product.characteristics.scent && (
            <span className="characteristic-tag">🌸 {product.characteristics.scent}</span>
          )} */}

        {/* <div className="product-card__actions">
            <Button
              onClick={() => navigate(`/products/${product.id}`)}
              variant="primary"
              size="sm"
              fullWidth
            >
              View Details & Sets
            </Button>
            {stockStatus.available && !product.can_do_bulk && (
              <Button
                onClick={() => {
                  toast.success(`${product.name} added to cart!`);
                }}
                variant="secondary"
                size="sm"
                fullWidth
                style={{ marginTop: '0.5rem' }}
              >
                Add to Cart
              </Button>
            )}
          </div> */}
      </div>
    </article>
  );
};

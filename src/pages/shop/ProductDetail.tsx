import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Product } from '@/types';
import { productService } from '@/services/productService';
import { ProductPurchaseOptions } from '@/components/shop/ProductPurchaseOptions';
import type { PriceBreakdown } from '@/utils/priceOptimizer';
import { Button } from '@/components/ui/Button';
import { ImageWithPlaceholder } from '@/components/ui/ImageWithPlaceholder';
import { ImagePreviewer } from '@/components/layout/ImagePreviewer';
import { AnnouncementMarquee } from '@/components/layout/AnnouncementMarquee';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductById(productId);
      
      if (!data) {
        setError('Product not found');
        return;
      }
      
      setProduct(data);
    } catch (err) {
      setError('Failed to load product. Please try again later.');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (quantity: number, purchaseType: 'piece' | 'set', breakdown: PriceBreakdown) => {
    // TODO: Implement actual cart logic
    console.log('Adding to cart:', {
      productId: product?.id,
      productName: product?.name,
      quantity,
      purchaseType,
      totalPrice: breakdown.totalPrice,
      breakdown: breakdown.breakdown,
      savings: breakdown.savings
    });
  };

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="product-detail__loading">
            <div className="loading__spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="product-detail__error">
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist.'}</p>
            <div className="product-detail__error-actions">
              <Button onClick={() => navigate(-1)} variant="secondary">
                Go Back
              </Button>
              <Link to="/products">
                <Button variant="primary">
                  Browse All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = productService.calculateDiscountPercentage(
    product.actual_price, 
    product.discounted_price
  );

  return (
    <>
    {product.in_stock && <AnnouncementMarquee />}
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail__content">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="product-gallery__main">
              <ImageWithPlaceholder
                src={product.images[currentImageIndex] || '/default-candle.jpg'}
                alt={product.name}
                width="100%"
                placeholder="shimmer"
                priority={false}
                className="product-gallery__image"
                fallback="/default-candle-fallback.jpg"
                onClick={() => setPreviewSrc(product.images[currentImageIndex] || '/default-candle.jpg')}
              />
              
              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button 
                    className="product-gallery__nav product-gallery__nav--prev"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button 
                    className="product-gallery__nav product-gallery__nav--next"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Badges */}
              {/* <div className="product-gallery__badges">
                {product.highlight_in_home && (
                  <div className="product-badge product-badge--featured">
                    ✨ Set discounts available
                  </div>
                )}
                {discountPercentage > 0 && (
                  <div className="product-badge product-badge--discount">
                    {discountPercentage}% OFF
                  </div>
                )}
              </div> */}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="product-gallery__thumbnails">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`product-gallery__thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-info__header">
              <span className="product-info__category">{product.category}</span>
              <h1 className="product-info__title">{product.name}</h1>
              
              {/* Pricing */}
              <div className="product-info__pricing">
                {discountPercentage > 0 ? (
                  <>
                    <span className="product-info__price-actual">₹{product.actual_price.toFixed(0)}</span>
                    <span className="product-info__price-discounted">₹{product.discounted_price.toFixed(0)}</span>
                    <span className="product-info__discount">({discountPercentage}% off)</span>
                  </>
                ) : (
                  <span className="product-info__price-single">₹{product.discounted_price.toFixed(0)}</span>
                )}
              </div>
              <small className="text-muted">*No additional shipping cost</small>
            </div>

            {/* Description */}
            {product.description && (
              <div className="product-info__description">
                <h3>About this candle</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Characteristics */}
            {product.characteristics && Object.keys(product.characteristics).length > 0 && (
              <div className="product-info__characteristics">
                <h3>Product Details</h3>
                <dl className="characteristics-list">
                  {/* {product.characteristics.colors && (
                    <>
                      <dt>🎨 Colors</dt>
                      <dd>
                        <ColorChips colors={product.characteristics.colors} showLabel={true} />
                      </dd>
                    </>
                  )} */}
                  {product.characteristics.scent && (
                    <>
                      <dt>🌸 Scent</dt>
                      <dd>{product.characteristics.scent}</dd>
                    </>
                  )}
                  {product.characteristics.burn_time && (
                    <>
                      <dt>⏰ Burn Time</dt>
                      <dd>{product.characteristics.burn_time}</dd>
                    </>
                  )}
                  {product.characteristics.dimensions && (
                    <>
                      <dt>📏 Dimensions</dt>
                      <dd>{product.characteristics.dimensions}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}

            {/* Set Pricing Info */}
            {product.price_sets && product.price_sets.length > 0 && (
              <div className="product-info__sets">
                <h3>Available Set Discounts</h3>
                <div className="sets-list">
                  {product.price_sets.map(set => {
                    const setDiscount = productService.calculateDiscountPercentage(
                      set.actual_price, 
                      set.discounted_price
                    );
                    return (
                      <div key={set.id} className="set-item">
                        <div className="set-item__info">
                          <strong>Set of {set.set_quantity}</strong>
                          <span className="set-item__savings">
                            Save ₹{(set.actual_price - set.discounted_price).toFixed(0)}
                          </span>
                        </div>
                        <div className="set-item__pricing">
                          <span className="set-item__price-actual">₹{set.actual_price.toFixed(0)}</span>
                          <span className="set-item__price-discounted">₹{set.discounted_price.toFixed(0)}</span>
                          {setDiscount > 0 && (
                            <span className="set-item__discount">({setDiscount}% off)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Purchase Options */}
          <div className="product-purchase">
            <ProductPurchaseOptions 
              product={product} 
              onAddToCart={handleAddToCart}
            />
            <div className="bulk-info">
              <h4>📦 You can order in bulk!</h4>
              <small>We offer discounted pricing for large-volume purchases and can discuss custom requirements.</small>
              <div className="contact-links">
                <a
                  className='btn btn--luxury btn--lg'
                  href="https://wa.me/+919036758208?text=Hi%20LavyaGlow%20Team%20(from%20App)"
                  target="_blank"
                  rel="noopener noreferrer">
                    <img src="https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/misc/WhatsApp.svg" alt='Instagram' />
                    Whatsapp
                </a>
                <a
                  className='btn btn--luxury btn--lg'
                  href="https://instagram.com/lavyaglow"
                  target="_blank"
                  rel="noopener noreferrer">
                    <img src="https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/misc/Instagram_logo.svg" alt='Instagram' />
                    Instagram
                </a>
              </div>
            </div>
          </div>
          
        </div>
        {product.description && (
              <div className="product-info__description mobile-view">
                <h3>About this candle</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Characteristics */}
            {product.characteristics && Object.keys(product.characteristics).length > 0 && (
              <div className="product-info__characteristics mobile-view">
                <h3>Product Details</h3>
                <dl className="characteristics-list">
                  {/* {product.characteristics.colors && (
                    <>
                      <dt>🎨 Colors</dt>
                      <dd>
                        <ColorChips colors={product.characteristics.colors} showLabel={true} />
                      </dd>
                    </>
                  )} */}
                  {product.characteristics.scent && (
                    <>
                      <dt>🌸 Scent</dt>
                      <dd>{product.characteristics.scent}</dd>
                    </>
                  )}
                  {product.characteristics.burn_time && (
                    <>
                      <dt>⏰ Burn Time</dt>
                      <dd>{product.characteristics.burn_time}</dd>
                    </>
                  )}
                  {product.characteristics.dimensions && (
                    <>
                      <dt>📏 Dimensions</dt>
                      <dd>{product.characteristics.dimensions}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
        {/* Back Button */}
        <div className="product-detail__actions">
          <Button onClick={() => navigate(-1)} variant="secondary">
            ← Back to Products
          </Button>
        </div>
        <ImagePreviewer src={previewSrc} onClose={() => setPreviewSrc(null)} />
      </div>
    </div></>
  );
}

import { useState, useEffect } from 'react';
import type { Product } from '@/types';
import { priceOptimizer, type PriceBreakdown } from '@/utils/priceOptimizer';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { ColorSelector } from '../features/ColorSelector';
import { stringToArray } from '@/constants/productOptions';

interface ProductPurchaseOptionsProps {
  product: Product;
  onAddToCart?: (quantity: number, purchaseType: 'piece' | 'set', breakdown: PriceBreakdown) => void;
}

export function ProductPurchaseOptions({ product, onAddToCart }: ProductPurchaseOptionsProps) {
  const [purchaseMode, setPurchaseMode] = useState<'piece' | 'set'>('piece');
  const [pieceQuantity, setPieceQuantity] = useState(1);
  const [selectedSet, setSelectedSet] = useState<string>('');
  const [setsCount, setSetsCount] = useState(1);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { addToCart } = useCart();

  // FIXED: Calculate optimal pricing with correct actual_price usage
  useEffect(() => {
    if (purchaseMode === 'piece' && pieceQuantity > 0) {
      const result = priceOptimizer.calculateOptimalPrice(
        pieceQuantity,
        product.discounted_price,  // ₹330 per piece (discounted)
        product.actual_price,      // ₹360 per piece (actual) - KEY FIX
        product.price_sets || []
      );
      setBreakdown(result);
    }
  }, [pieceQuantity, product.discounted_price, product.actual_price, product.price_sets, purchaseMode]);

  useEffect(() => {
    // Set default color if available
    if (product.characteristics?.colors && !selectedColor) {
      const colors = stringToArray(product.characteristics.colors);
      if (colors.length === 1) {
        setSelectedColor(colors[0]);
      }
    }
  }, [product.characteristics, selectedColor]);

  // FIXED: Calculate set optimization with correct actual_price usage  
  useEffect(() => {
    if (purchaseMode === 'set' && selectedSet && setsCount > 0) {
      try {
        const optimizedResult = priceOptimizer.optimizeSetPurchase(
          selectedSet,
          setsCount,
          product.discounted_price,  // ₹330 per piece (discounted)
          product.actual_price,      // ₹360 per piece (actual) - KEY FIX
          product.price_sets || []
        );
        
        setBreakdown(optimizedResult);
      } catch (error) {
        console.error('Error optimizing set purchase:', error);
        // Fallback calculation with corrected original price
        const set = product.price_sets?.find(s => s.id === selectedSet);
        if (set) {
          const totalPieces = set.set_quantity * setsCount;
          const totalPrice = set.discounted_price * setsCount;
          // FIX: Use actual_price for original price calculation
          const originalPrice = product.actual_price * totalPieces; 
          
          setBreakdown({
            totalPrice,
            totalPieces,
            breakdown: [{
              type: 'set',
              quantity: setsCount,
              setSize: set.set_quantity,
              unitPrice: set.discounted_price,
              totalPrice: totalPrice
            }],
            savings: originalPrice - totalPrice,
            originalPrice,
            isOptimized: false
          });
        }
      }
    }
  }, [purchaseMode, selectedSet, setsCount, product.price_sets, product.discounted_price, product.actual_price]);

  const handlePieceQuantityChange = (value: number) => {
    if (value < 1) return;
    if (!product.can_do_bulk && value > product.stock_quantity) {
      toast.error(`Only ${product.stock_quantity} units available`);
      return;
    }
    setPieceQuantity(value);
  };

  const handleSetsCountChange = (value: number) => {
    if (value < 1) return;
    setSetsCount(value);
  };

  const handleAddToCart = async () => {
    if (!breakdown) return;
    if (product.characteristics?.colors && !selectedColor) {
      const element = document.getElementById("product-color-selector");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" }); // smooth scroll
      }
      toast.error('Please select a color');
      return;
    }
    setIsAddingToCart(true);
    try {
      // Check if similar item already exists in cart
      // const existingItem = getCartItem(
      //   product.id, 
      //   purchaseMode, 
      //   purchaseMode === 'set' ? selectedSet : undefined
      // );

      // Add to cart
      addToCart({
        product,
        quantity: purchaseMode === 'piece' ? pieceQuantity : setsCount,
        purchaseType: purchaseMode,
        setId: purchaseMode === 'set' ? selectedSet : undefined,
        breakdown,
        selectedColor: selectedColor as string
      });

      // Success message
      const itemDescription = purchaseMode === 'set' 
        ? `${setsCount} set${setsCount > 1 ? 's' : ''} (${breakdown.totalPieces} pieces)`
        : `${pieceQuantity} piece${pieceQuantity > 1 ? 's' : ''}`;
      const colorInfo = selectedColor ? ` in ${selectedColor}` : '';
      toast.success(
        `Added ${itemDescription} of ${product.name}${colorInfo} to cart!`,
        {
          duration: 3000,
          icon: '🛒',
        }
      );

      // Call optional callback
      if (onAddToCart) {
        onAddToCart(breakdown.totalPieces, purchaseMode, breakdown);
      }

      // Reset form for better UX
      if (purchaseMode === 'piece') {
        setPieceQuantity(1);
      } else {
        setSetsCount(1);
      }

    } catch (error) {
      toast.error('Error adding to cart. Please try again.');
      console.error('Add to cart error:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getStockStatus = () => {
    if (!product.in_stock) return { available: false, text: 'Out of Stock' };
    if (product.can_do_bulk) return { available: true, text: 'Available for Bulk Orders' };
    return { available: true, text: `${product.stock_quantity} units available` };
  };

  const stockStatus = getStockStatus();
  const hasSets = product.price_sets && product.price_sets.length > 0;

  return (
    <div className="purchase-options">
      {!stockStatus.available && (
        <div className="purchase-options__header">
          <div className={`stock-status out-of-stock'}`}>
            {stockStatus.text}
          </div>
        </div>
      )}

      {product.characteristics?.colors && (
        <ColorSelector
          id='product-color-selector'
          availableColors={product.characteristics.colors}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          size="md"
        />
      )}
      {!stockStatus.available ? (
        <div className="purchase-options__unavailable">
          <p>This product is currently out of stock.</p>
          {product.can_do_bulk && (
            <div className="bulk-contact">
              <p>For bulk orders, contact us:</p>
              <div className="contact-links">
                <a
                  href="https://wa.me/+919036758208"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📱 WhatsApp
                </a>
                <a
                  href="https://instagram.com/lavyaglow"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📷 Instagram
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Purchase Mode Toggle */}
          {hasSets && (
            <div className="purchase-mode">
              <div className="mode-tabs">
                <button
                  className={`mode-tab ${
                    purchaseMode === "piece" ? "active" : ""
                  }`}
                  onClick={() => setPurchaseMode("piece")}
                >
                  <span className="mode-icon">🔢</span>
                  <div>
                    <strong>By Pieces</strong>
                    <small>Smart pricing optimization</small>
                  </div>
                </button>
                <button
                  className={`mode-tab ${
                    purchaseMode === "set" ? "active" : ""
                  }`}
                  onClick={() => setPurchaseMode("set")}
                >
                  <span className="mode-icon">📦</span>
                  <div>
                    <strong>By Sets</strong>
                    {product.price_sets && product.price_sets.length > 0 && (<small>
                      Upto{" "}
                      <span style={{ fontWeight: '600' }}>{(
                        ((product.price_sets[product.price_sets.length - 1]
                          .actual_price -
                          product.price_sets[product.price_sets.length - 1]
                            .discounted_price) /
                          product.price_sets[product.price_sets.length - 1]
                            .actual_price) *
                        100
                      ).toFixed()}{" "}
                      %</span> off on buying in sets
                    </small>)}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Piece Purchase */}
          {purchaseMode === "piece" && (
            <div className="purchase-section">
              <div className="quantity-input">
                <label>Number of Pieces:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => handlePieceQuantityChange(pieceQuantity - 1)}
                    disabled={pieceQuantity <= 1}
                  >
                    -
                  </button>
                  <Input
                    type="number"
                    value={pieceQuantity.toString()}
                    onChange={(e) =>
                      handlePieceQuantityChange(parseInt(e.target.value) || 1)
                    }
                    min="1"
                    max={
                      product.can_do_bulk ? undefined : product.stock_quantity
                    }
                  />
                  <button
                    onClick={() => handlePieceQuantityChange(pieceQuantity + 1)}
                    disabled={
                      !product.can_do_bulk &&
                      pieceQuantity >= product.stock_quantity
                    }
                  >
                    +
                  </button>
                </div>
                {/* <small>Per piece: ₹{product.discounted_price}</small> */}
              </div>
              {breakdown && hasSets && breakdown.savings > 0 && priceOptimizer.getBreakdownText(breakdown)?.includes('Set') && (
                <div className="optimization-info">
                  <div className="optimization-badge">
                    🎯 Smart Optimization Active
                  </div>
                  <br />
                  <small>{priceOptimizer.getBreakdownText(breakdown)}</small>
                  <br />
                  <small className="savings" style={{ fontWeight: '600' }}>
                    {priceOptimizer.getSavingsMessage(breakdown)}
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Set Purchase - ENHANCED WITH OPTIMIZATION */}
          {purchaseMode === "set" && hasSets && (
            <div className="purchase-section">
              <div className="set-selection">
                <label>Choose Set Size:</label>
                <select
                  value={selectedSet}
                  onChange={(e) => setSelectedSet(e.target.value)}
                >
                  <option value="">Select a set...</option>
                  {product.price_sets!.map((set) => (
                    <option key={set.id} value={set.id}>
                      Set of {set.set_quantity} - ₹{set.discounted_price}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSet && (
                <div className="set-quantity-input">
                  <label>Number of Sets:</label>
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleSetsCountChange(setsCount - 1)}
                      disabled={setsCount <= 1}
                    >
                      -
                    </button>
                    <Input
                      type="number"
                      value={setsCount.toString()}
                      onChange={(e) =>
                        handleSetsCountChange(parseInt(e.target.value) || 1)
                      }
                      min="1"
                    />
                    <button
                      onClick={() => handleSetsCountChange(setsCount + 1)}
                    >
                      +
                    </button>
                  </div>
                  <small>
                    Total pieces:{" "}
                    {selectedSet
                      ? (product.price_sets?.find((s) => s.id === selectedSet)
                          ?.set_quantity || 0) * setsCount
                      : 0}
                  </small>
                </div>
              )}

              {/* SET OPTIMIZATION DISPLAY */}
              {breakdown && breakdown.isOptimized && selectedSet && (
                <div className="optimization-info optimization-info--set">
                  <div className="optimization-badge">
                    🚀 Set Optimization Active
                  </div>
                  <br />
                  <small className="optimization-message">
                    {breakdown.optimizationMessage}
                  </small>
                  <br />
                  <small className="savings">
                    {priceOptimizer.getSavingsMessage(breakdown)}
                  </small>
                </div>
              )}
            </div>
          )}

          {/* FIXED Price Summary - Shows correct pricing */}
          {breakdown &&
            ((purchaseMode === "set" && hasSets && selectedSet) ||
              purchaseMode === "piece") && (
              <div className="price-summary">
                <div className="price-breakdown">
                  <div className="price-line">
                    <span>Total Pieces:</span>
                    <span>{breakdown.totalPieces}</span>
                  </div>
                  <div className="price-line original">
                    <span>Regular Price:</span>
                    <span>₹{breakdown.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="price-line total">
                    <span>Your Price:</span>
                    <span>₹{breakdown.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="price-line savings">
                    <span>You Save:</span>
                    <span>₹{breakdown.savings.toFixed(2)}</span>
                  </div>
                  {/* Total Discount Percentage */}
                  <div className="price-line total-discount">
                    <span>Total Discount:</span>
                    <span>
                      {priceOptimizer.getTotalDiscountPercentage(breakdown)}%
                    </span>
                  </div>
                </div>

                {breakdown.breakdown.length > 1 && (
                  <div className="breakdown-details">
                    <h5>Optimized Purchase:</h5>
                    <ul>
                      {breakdown.breakdown.map((item, index) => (
                        <li key={index}>
                          {item.quantity} x{" "}
                          {item.type === "set"
                            ? `Set of ${item.setSize}`
                            : "Individual"}
                          = ₹{item.totalPrice.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={handleAddToCart}
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!breakdown.totalPieces || isAddingToCart}
                  loading={isAddingToCart}
                  className="add-to-cart"
                >
                  {isAddingToCart ? "Adding to Cart..." : `Add to Cart`}
                  {/* <span className="button-price">₹{breakdown.totalPrice.toFixed(2)}</span> */}
                </Button>
              </div>
            )}

          {/* Bulk Order Message */}
          {product.can_do_bulk && (
            <div className="bulk-info">
              <h4>📦 Bulk Orders Available</h4>
              <small>For large quantities or custom requirements:</small>
              <div className="contact-links">
                <a
                  href="https://wa.me/+919038644125"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📱 WhatsApp
                </a>
                <a
                  href="https://instagram.com/lavyaglow"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📷 Instagram
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

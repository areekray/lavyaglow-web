import type { ProductPriceSet } from '@/types';

export interface PriceBreakdown {
  totalPrice: number;
  totalPieces: number;
  breakdown: Array<{
    type: 'set' | 'piece';
    quantity: number;
    setSize?: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  savings: number;
  originalPrice: number;
  isOptimized?: boolean;
  optimizationMessage?: string;
}

interface BuyingOption {
  type: 'piece' | 'set';
  size: number;
  price: number;
  originalSet?: ProductPriceSet;
}

export const priceOptimizer = {
  // Enhanced algorithm with corrected pricing calculation
  calculateOptimalPrice(
    quantity: number, 
    discountedUnitPrice: number,  // ₹330 per piece
    actualUnitPrice: number,      // ₹360 per piece - for original price calculation
    priceSets: ProductPriceSet[]
  ): PriceBreakdown {
    if (quantity <= 0) {
      return {
        totalPrice: 0,
        totalPieces: 0,
        breakdown: [],
        savings: 0,
        originalPrice: 0
      };
    }

    // Create buying options using discounted prices for optimization
    const buyingOptions: BuyingOption[] = [
      {
        type: 'piece',
        size: 1,
        price: discountedUnitPrice  // Use discounted price for calculations
      },
      ...priceSets.map(set => ({
        type: 'set' as const,
        size: set.set_quantity,
        price: set.discounted_price,
        originalSet: set
      }))
    ];

    // Dynamic programming to find optimal combination
    const dp = new Array(quantity + 1).fill(Infinity);
    const parent = new Array(quantity + 1).fill(-1);
    const optionUsed = new Array(quantity + 1).fill(-1);
    
    dp[0] = 0;

    // Try each buying option for each quantity
    for (let q = 1; q <= quantity; q++) {
      buyingOptions.forEach((option, optionIndex) => {
        if (option.size <= q) {
          const newPrice = dp[q - option.size] + option.price;
          if (newPrice < dp[q]) {
            dp[q] = newPrice;
            parent[q] = q - option.size;
            optionUsed[q] = optionIndex;
          }
        }
      });
    }

    // Reconstruct the optimal solution
    const breakdown: PriceBreakdown['breakdown'] = [];
    let current = quantity;
    
    while (current > 0) {
      const prev = parent[current];
      const option = buyingOptions[optionUsed[current]];
      
      const existingItem = breakdown.find(item => 
        item.type === option.type && 
        (option.type === 'piece' || item.setSize === option.size)
      );
      
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.totalPrice += option.price;
      } else {
        breakdown.push({
          type: option.type,
          quantity: 1,
          setSize: option.type === 'set' ? option.size : undefined,
          unitPrice: option.price,
          totalPrice: option.price
        });
      }
      
      current = prev;
    }

    const totalPrice = dp[quantity];
    // KEY FIX: Use actualUnitPrice for original price calculation
    const originalPrice = quantity * actualUnitPrice; // ₹360 × 6 = ₹2160
    const savings = originalPrice - totalPrice;

    return {
      totalPrice,
      totalPieces: quantity,
      breakdown: breakdown.reverse(),
      savings,
      originalPrice
    };
  },

  // Fixed set optimization method
  optimizeSetPurchase(
    selectedSetId: string,
    selectedSetQuantity: number,
    discountedUnitPrice: number,  // ₹330 per piece
    actualUnitPrice: number,      // ₹360 per piece
    priceSets: ProductPriceSet[]
  ): PriceBreakdown {
    const selectedSet = priceSets.find(s => s.id === selectedSetId);
    if (!selectedSet) {
      throw new Error('Selected set not found');
    }

    const totalPieces = selectedSet.set_quantity * selectedSetQuantity;
    const naivePrice = selectedSet.discounted_price * selectedSetQuantity;

    // Use the corrected optimizer
    const optimizedResult = this.calculateOptimalPrice(
      totalPieces, 
      discountedUnitPrice, 
      actualUnitPrice,  // Pass actual price for correct original price calculation
      priceSets
    );

    const isOptimized = optimizedResult.totalPrice < naivePrice;
    // const setOptimizationSavings = naivePrice - optimizedResult.totalPrice;

    let optimizationMessage = '';
    if (isOptimized) {
      const originalBreakdown = selectedSetQuantity + ' x Set of ' + selectedSet.set_quantity;
      const optimizedBreakdown = this.getBreakdownText(optimizedResult);
      optimizationMessage = 'Optimized from "' + originalBreakdown + '" to "' + optimizedBreakdown + '"';
    }

    return {
      ...optimizedResult,
      // Keep the corrected original price from the optimizer (using actual_price)
      savings: optimizedResult.savings, // This includes both individual + set optimization savings
      isOptimized,
      optimizationMessage
    };
  },

  // Get readable breakdown text
  getBreakdownText(breakdown: PriceBreakdown): string {
    if (breakdown.breakdown.length === 0) return '';
    
    const parts = breakdown.breakdown.map(item => {
      if (item.type === 'set') {
        return item.quantity + ' x Set of ' + item.setSize;
      } else {
        return item.quantity + ' x Individual piece' + (item.quantity > 1 ? 's' : '');
      }
    });

    return parts.join(' + ');
  },

  // Calculate total discount percentage
  getTotalDiscountPercentage(breakdown: PriceBreakdown): number {
    if (breakdown.originalPrice <= 0) return 0;
    return Math.round((breakdown.savings / breakdown.originalPrice) * 100);
  },

  // Enhanced savings message with total discount
  getSavingsMessage(breakdown: PriceBreakdown): string {
    if (breakdown.savings <= 0) return '';
    
    const percentage = this.getTotalDiscountPercentage(breakdown);
    return 'You save ₹' + breakdown.savings.toFixed(2) + ' (' + percentage + '% total discount)';
  },

  // Test function to verify calculations
  testOptimization() {
    const testSets = [
      { 
        id: 'set-2', 
        product_id: 'test', 
        set_quantity: 2, 
        actual_price: 720, 
        discounted_price: 640, 
        created_at: '', 
        updated_at: '' 
      },
      { 
        id: 'set-4', 
        product_id: 'test', 
        set_quantity: 4, 
        actual_price: 1440, 
        discounted_price: 1250, 
        created_at: '', 
        updated_at: '' 
      }
    ];
    
    const discountedUnitPrice = 330; // Current discounted price
    const actualUnitPrice = 360;     // Original actual price
    
    console.log('=== FIXED PRICE OPTIMIZER TESTS ===');
    
    // Test: 6 pieces should show correct savings
    const result6 = this.calculateOptimalPrice(6, discountedUnitPrice, actualUnitPrice, testSets);
    console.log('6 pieces result:', result6);
    console.log('Expected: Original ₹2160, Optimized ~₹1890, Savings ~₹270');
    console.log('Breakdown:', this.getBreakdownText(result6));
    console.log('Savings message:', this.getSavingsMessage(result6));
    
    return result6;
  }
};

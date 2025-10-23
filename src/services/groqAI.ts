// services/groqAI.ts
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CACHE_KEY_PREFIX = 'lavyaglow_category_desc_';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedDescription {
  text: string;
  timestamp: number;
}

export const generateCategoryDescription = async (
  category: string,
  productCount: number
): Promise<string> => {
  // Cache key based on category name
  const cacheKey = `${CACHE_KEY_PREFIX}${category.toLowerCase().replace(/\s+/g, '_')}`;
  
  // Try cache first (CacheFirst strategy)
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { text, timestamp }: CachedDescription = JSON.parse(cached);
      const now = Date.now();
      
      // Return cached if still valid
      if (now - timestamp < CACHE_DURATION) {
        console.log(`Using cached description for ${category}`);
        return text;
      }
    } catch (error) {
      console.error('Error parsing cached description:', error);
    }
  }

  // Cache miss or expired - fetch from Groq API
  console.log(`Generating fresh description for ${category}`);
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a creative copywriter for LavyaGlow, a luxury handcrafted candle brand. Write engaging, concise product category descriptions.',
          },
          {
            role: 'user',
            content: `Write a single elegant sentence (max 20 words) describing our candle collection of type ${category}. Focus on luxury, craftsmanship, and ambiance.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content.trim();

    // Cache the result
    const cacheData: CachedDescription = {
      text,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));

    return text;
  } catch (error) {
    console.error('Groq API error:', error);
    
    // Return cached even if expired as fallback
    if (cached) {
      try {
        const { text }: CachedDescription = JSON.parse(cached);
        console.log(`Using stale cached description for ${category} due to error`);
        return text;
      } catch {
        // Ignore parse error
      }
    }
    
    // Final fallback
    return `Explore our handcrafted ${category.toLowerCase()} collection — ${productCount} unique designs crafted with care and intention`;
  }
};

// Utility to clear all category description caches
export const clearCategoryDescriptionCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

// Utility to pre-warm cache for all categories
export const preWarmCategoryDescriptions = async (categories: string[]) => {
  const promises = categories.map(category => 
    generateCategoryDescription(category, 0) // productCount not used in prompt
  );
  
  try {
    await Promise.allSettled(promises);
    console.log('Category descriptions pre-warmed');
  } catch (error) {
    console.error('Error pre-warming category descriptions:', error);
  }
};

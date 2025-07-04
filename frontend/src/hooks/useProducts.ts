import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
}

export function useProducts(categoryName?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);
        
        const url = categoryName 
          ? `/api/products/category/${encodeURIComponent(categoryName)}`
          : '/api/products';
          
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [categoryName]);

  return { products, isLoading, error };
} 
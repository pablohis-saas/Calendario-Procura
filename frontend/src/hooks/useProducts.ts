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
    let isMounted = true;
    async function fetchProductsWithRetry(retries = 3) {
      let lastError: any = null;
      for (let attempt = 1; attempt <= retries; attempt++) {
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
          if (isMounted) {
            setProducts(data);
            setIsLoading(false);
            setError(null);
          }
          return;
        } catch (err) {
          lastError = err;
          if (attempt < retries) {
            // Espera 2 segundos antes de reintentar
            await new Promise(res => setTimeout(res, 2000));
          }
        }
      }
      if (isMounted) {
        setError(lastError instanceof Error ? lastError.message : 'Error desconocido');
        setIsLoading(false);
      }
    }
    fetchProductsWithRetry();
    return () => { isMounted = false; };
  }, [categoryName]);

  return { products, isLoading, error };
} 
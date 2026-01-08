import { useState, useEffect, useCallback, useRef } from 'react';

const useInfiniteScroll = (fetchFunction, dependencies = []) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(page);
      
      if (result.items && result.items.length > 0) {
        setItems(prev => page === 1 ? result.items : [...prev, ...result.items]);
        setHasMore(result.hasMore);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load more items');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, loading, hasMore]);

  // Intersection Observer callback
  const lastItemRef = useCallback((node) => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { threshold: 0.1 });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, loadMore]);

  // Reset when dependencies change
  useEffect(() => {
    reset();
  }, [...dependencies]);

  // Initial load
  useEffect(() => {
    if (page === 1 && hasMore && items.length === 0) {
      loadMore();
    }
  }, [page, hasMore, items.length]);

  return {
    items,
    loading,
    hasMore,
    error,
    lastItemRef,
    reset,
    loadMore,
    setItems
  };
};

export default useInfiniteScroll;

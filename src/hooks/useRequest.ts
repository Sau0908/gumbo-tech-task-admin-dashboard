import { useCallback, useEffect, useRef, useState } from "react";

export function useRequest<T>(
  request: () => Promise<T>,
  dependencies: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await request();
      if (mounted.current) setData(result);
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof Error ? cause : new Error("Something went wrong."),
        );
    } finally {
      if (mounted.current) setIsLoading(false);
    }
    // The caller controls when a request should be recreated through dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);
  return { data, isLoading, error, reload: load, setData };
}

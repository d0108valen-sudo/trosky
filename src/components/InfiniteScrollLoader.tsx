import React, { useEffect, useRef } from 'react';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface InfiniteScrollLoaderProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onOpenCreate: () => void;
}

export const InfiniteScrollLoader: React.FC<InfiniteScrollLoaderProps> = ({
  isLoading,
  hasMore,
  onLoadMore,
  onOpenCreate,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div ref={sentinelRef} className="w-full py-12 flex flex-col items-center justify-center text-center">
      {isLoading && (
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-3 border-[#c94d3f]/20 border-t-[#c94d3f] animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-xs">
              🌸
            </span>
          </div>
          <p className="text-xs font-medium text-[#7d6b62]">
            Cargando más historias y memorias comunitarias...
          </p>
        </div>
      )}

      {!hasMore && (
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#f5ede4] border border-[#e6dbce] text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white flex items-center justify-center text-xl shadow-xs">
            ✨
          </div>
          <h4 className="font-display font-bold text-sm text-[#2c2420] mb-1">
            Has explorado todo el archivo de esta sección
          </h4>
          <p className="text-xs text-[#6e5d53] leading-relaxed mb-4">
            Cada día se suman nuevas anécdotas, recetas y recuerdos familiares. ¿Te gustaría dejar tu propia huella en Trosky?
          </p>
          <button
            onClick={onOpenCreate}
            className="px-5 py-2 text-xs font-bold text-white bg-[#c94d3f] hover:bg-[#b03d30] rounded-full shadow-sm transition-all cursor-pointer"
          >
            Guardar mi historia ahora
          </button>
        </div>
      )}
    </div>
  );
};

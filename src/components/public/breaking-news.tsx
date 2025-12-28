import React, { useState, useEffect } from 'react';
import { useArticles } from '@/hooks/use-articles';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Clock, GraduationCap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function BreakingNews() {
  const { data: latestData } = useArticles(undefined, 1, 5);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (latestData?.articles && latestData.articles.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % latestData.articles.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [latestData?.articles]);

  if (!latestData?.articles || latestData.articles.length === 0) {
    return null;
  }

  const currentArticle = latestData.articles[currentIndex];

  return (
    <div className="bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-green-500/10 border-y border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-2 overflow-hidden">
          <Badge className="shrink-0 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0 flex items-center gap-1.5">
            <GraduationCap className="h-3 w-3" />
            STUDENT NEWS
          </Badge>
          <div className="flex-1 min-w-0">
            <Link 
              to={`/article/${currentArticle.slug}`}
              className="block group"
            >
              <div className="flex items-center gap-2 text-sm">
                <p className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {currentArticle.title}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(currentArticle.published_at), { addSuffix: true })}
                </div>
              </div>
            </Link>
          </div>
          {latestData.articles.length > 1 && (
            <div className="flex gap-1 shrink-0">
              {latestData.articles.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-gradient-to-r from-blue-600 to-teal-600' : 'bg-blue-500/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

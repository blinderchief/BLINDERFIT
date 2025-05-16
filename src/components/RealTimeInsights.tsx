import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface RealTimeInsightsProps {
  topic?: string;
  refreshInterval?: number; // in milliseconds
}

export default function RealTimeInsights({ 
  topic = 'fitness trends', 
  refreshInterval = 3600000 // 1 hour default
}: RealTimeInsightsProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const functions = getFunctions();
      const getInsights = httpsCallable(functions, 'getRealTimeFitnessInsightsModern');
      
      const result = await getInsights({ topic });
      const data = result.data as any;
      
      setInsights(data.insights);
      setLastUpdated(new Date(data.timestamp));
    } catch (err: any) {
      console.error('Error fetching insights:', err);
      setError(err.message || 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    
    // Set up interval for refreshing data
    if (refreshInterval > 0) {
      const interval = setInterval(fetchInsights, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [topic, refreshInterval]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Latest {topic.charAt(0).toUpperCase() + topic.slice(1)}</CardTitle>
        <CardDescription>
          {lastUpdated 
            ? `Last updated: ${lastUpdated.toLocaleTimeString()} on ${lastUpdated.toLocaleDateString()}`
            : 'Fetching latest insights...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && !insights ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-destructive py-4">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchInsights} 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Latest Information</h3>
              <p>{insights?.mainAnswer}</p>
            </div>
            
            {insights?.additionalInfo && (
              <div>
                <h3 className="font-semibold text-lg">Additional Context</h3>
                <p>{insights.additionalInfo}</p>
              </div>
            )}
            
            {insights?.personalizedTips && (
              <div>
                <h3 className="font-semibold text-lg">Tips & Recommendations</h3>
                <p>{insights.personalizedTips}</p>
              </div>
            )}
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchInsights}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

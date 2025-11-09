import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface AIRecommendationCardProps {
  title: string;
  recommendations: string[];
  category?: string;
  testId?: string;
}

export default function AIRecommendationCard({
  title,
  recommendations,
  category,
  testId,
}: AIRecommendationCardProps) {
  return (
    <Card className="border-l-4 border-l-primary" data-testid={testId}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {title}
          {category && (
            <Badge variant="secondary" className="ml-auto">
              {category}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {recommendations.map((rec, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm"
              data-testid={`${testId}-item-${i}`}
            >
              <span className="text-primary mt-1">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

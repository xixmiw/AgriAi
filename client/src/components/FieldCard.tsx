import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Edit, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FieldCardProps {
  id: string;
  name: string;
  area: number;
  crop: string;
  location: string;
  status?: 'healthy' | 'attention' | 'critical';
  testId?: string;
}

interface Recommendations {
  title: string;
  recommendations: string[];
}

const statusColors = {
  healthy: 'bg-green-500',
  attention: 'bg-yellow-500',
  critical: 'bg-red-500',
};

export default function FieldCard({
  id,
  name,
  area,
  crop,
  location,
  status = 'healthy',
  testId,
}: FieldCardProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);

  const categoryLabels: Record<string, string> = {
    fertilizer: 'Удобрения',
    soil: 'Почва',
    pesticides: 'Пестициды',
  };

  const fetchRecommendations = useMutation({
    mutationFn: async (category: 'fertilizer' | 'soil' | 'pesticides') => {
      const res = await apiRequest('GET', `/api/fields/${id}/recommendations/${category}`);
      return await res.json();
    },
    onSuccess: (data) => {
      setRecommendations(data);
      setShowRecommendations(true);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message || 'Не удалось получить рекомендации',
      });
    },
  });

  const handleRecommendationClick = (category: 'fertilizer' | 'soil' | 'pesticides') => {
    fetchRecommendations.mutate(category);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50" data-testid={testId}>
        <CardHeader className="border-b bg-accent/30">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2" data-testid={`${testId}-name`}>
                {name}
                <div className={`h-3 w-3 rounded-full ${statusColors[status]} animate-pulse`} />
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span data-testid={`${testId}-location`}>{location}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('fields.area')}:</span>
              <span className="font-medium" data-testid={`${testId}-area`}>
                {area} {t('fields.hectares')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('fields.crop')}:</span>
              <Badge variant="secondary" data-testid={`${testId}-crop`}>{crop}</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => console.log('Edit field:', id)}
            data-testid={`${testId}-edit`}
          >
            <Edit className="h-4 w-4 mr-1" />
            {t('common.edit')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={fetchRecommendations.isPending}
                data-testid={`${testId}-menu`}
              >
                {fetchRecommendations.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreVertical className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleRecommendationClick('fertilizer')}>
                {categoryLabels.fertilizer}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRecommendationClick('soil')}>
                {categoryLabels.soil}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRecommendationClick('pesticides')}>
                {categoryLabels.pesticides}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Delete field:', id)}
            data-testid={`${testId}-delete`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showRecommendations} onOpenChange={setShowRecommendations}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{recommendations?.title}</DialogTitle>
            <DialogDescription>
              AI рекомендации для поля "{name}"
            </DialogDescription>
          </DialogHeader>

          {recommendations && (
            <div className="space-y-2">
              {recommendations.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <Badge variant="outline" className="mt-0.5 shrink-0">
                    {i + 1}
                  </Badge>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowRecommendations(false)}>
              Понятно
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

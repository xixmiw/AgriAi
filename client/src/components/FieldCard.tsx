import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Trash2, BarChart3 } from 'lucide-react';
import FieldSummaryDialog from './FieldSummaryDialog';

interface FieldCardProps {
  id: string;
  name: string;
  area: number;
  crop: string;
  location: string;
  status?: 'healthy' | 'attention' | 'critical';
  testId?: string;
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
  const [showSummary, setShowSummary] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-500/50 hover:scale-[1.02]" data-testid={testId}>
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative border-b bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2" data-testid={`${testId}-name`}>
                {name}
                <div className={`h-3 w-3 rounded-full ${statusColors[status]} animate-pulse shadow-lg`} />
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span data-testid={`${testId}-location`}>{location}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-3">
            <div className="flex justify-between text-sm p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <span className="text-muted-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {t('fields.area')}:
              </span>
              <span className="font-bold text-green-700 dark:text-green-400" data-testid={`${testId}-area`}>
                {area} {t('fields.hectares')}
              </span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">{t('fields.crop')}:</span>
              <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900 border-emerald-300 dark:border-emerald-700" data-testid={`${testId}-crop`}>{crop}</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="relative gap-2 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/10 dark:to-emerald-950/10">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
            onClick={() => setShowSummary(true)}
            data-testid={`${testId}-summary`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Полная сводка
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950/30 transition-colors"
            onClick={() => console.log('Delete field:', id)}
            data-testid={`${testId}-delete`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <FieldSummaryDialog
        fieldId={id}
        fieldName={name}
        crop={crop}
        open={showSummary}
        onOpenChange={setShowSummary}
      />
    </>
  );
}

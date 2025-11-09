import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FieldCard from '@/components/FieldCard';
import AddFieldDialog from '@/components/AddFieldDialog';
import { Plus, MapPin } from 'lucide-react';
import type { Field } from '@shared/schema';

export default function Fields() {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: fields = [], isLoading } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-green-200 dark:border-green-800 shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNiwgMTg1LCAxMjksIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent" data-testid="title-fields">
              {t('fields.title')}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              🌾 Управление и мониторинг сельскохозяйственных полей
            </p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            data-testid="button-add-field"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('fields.addNew')}
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Нет добавленных полей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Начните с добавления информации о ваших полях: координаты, площадь и тип культуры. 
              Это позволит AI анализировать данные и предоставлять рекомендации.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-field">
              <Plus className="h-4 w-4 mr-2" />
              Добавить первое поле
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <FieldCard
              key={field.id}
              id={field.id}
              name={field.name}
              area={Number(field.area)}
              crop={field.cropType}
              location={`${field.latitude}°N, ${field.longitude}°E`}
              status="healthy"
              testId={`field-card-${field.id}`}
            />
          ))}
        </div>
      )}

      <AddFieldDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}

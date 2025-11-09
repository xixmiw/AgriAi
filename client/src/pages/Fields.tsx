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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="title-fields">
            {t('fields.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Управление и мониторинг сельскохозяйственных полей
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-field">
          <Plus className="h-4 w-4 mr-2" />
          {t('fields.addNew')}
        </Button>
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

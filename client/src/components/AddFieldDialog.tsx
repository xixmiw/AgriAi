import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { insertFieldSchema, type InsertField } from '@shared/schema';
import { parseDMSCoordinate } from '@/lib/coordinates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

interface FieldAnalysis {
  summary: string;
  recommendations: string[];
  yieldOptimization: string[];
  risks: string[];
  timeline: string;
}

interface AddFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const cropTypes = [
  { value: 'wheat', label: { en: 'Wheat', ru: 'Пшеница', kk: 'Бидай' } },
  { value: 'corn', label: { en: 'Corn', ru: 'Кукуруза', kk: 'Жүгері' } },
  { value: 'barley', label: { en: 'Barley', ru: 'Ячмень', kk: 'Арпа' } },
  { value: 'sunflower', label: { en: 'Sunflower', ru: 'Подсолнечник', kk: 'Күнбағыс' } },
  { value: 'potato', label: { en: 'Potato', ru: 'Картофель', kk: 'Картоп' } },
  { value: 'sugar_beet', label: { en: 'Sugar Beet', ru: 'Сахарная свекла', kk: 'Қант қызылшасы' } },
];

export default function AddFieldDialog({ open, onOpenChange }: AddFieldDialogProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [coordinateInput, setCoordinateInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<FieldAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const form = useForm<Omit<InsertField, 'userId'>>({
    resolver: zodResolver(insertFieldSchema.omit({ userId: true })),
    defaultValues: {
      name: '',
      latitude: '51.1694',
      longitude: '71.4491',
      area: '10',
      cropType: 'wheat',
    },
  });

  const handleCoordinatePaste = (value: string) => {
    setCoordinateInput(value);
    const parsed = parseDMSCoordinate(value);
    if (parsed) {
      form.setValue('latitude', parsed.latitude.toFixed(7));
      form.setValue('longitude', parsed.longitude.toFixed(7));
      toast({
        title: 'Координаты распознаны',
        description: `Широта: ${parsed.latitude.toFixed(7)}, Долгота: ${parsed.longitude.toFixed(7)}`,
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: Omit<InsertField, 'userId'>) => {
      const res = await apiRequest('POST', '/api/fields', data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/fields'] });
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        setShowAnalysis(true);
      }
      toast({
        title: 'Успешно',
        description: 'Поле добавлено успешно',
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message || 'Не удалось добавить поле',
      });
    },
  });

  const onSubmit = (data: Omit<InsertField, 'userId'>) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent data-testid="dialog-add-field">
          <DialogHeader>
            <DialogTitle>{t('fields.addNew')}</DialogTitle>
            <DialogDescription>
              Добавьте информацию о новом поле для AI-анализа
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название поля</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Северное поле"
                        {...field}
                        data-testid="input-field-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Координаты Google Maps (или вручную)
                </label>
                <Input
                  type="text"
                  placeholder={'Вставьте: 54°52\'59.2"N 69°14\'13.8"E'}
                  value={coordinateInput}
                  onChange={(e) => handleCoordinatePaste(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Скопируйте координаты из Google Maps и вставьте сюда
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Широта (°N)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="51.1694"
                          {...field}
                          data-testid="input-field-latitude"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Долгота (°E)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="71.4491"
                          {...field}
                          data-testid="input-field-longitude"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Площадь ({t('fields.hectares')})</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="10"
                        {...field}
                        data-testid="input-field-area"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.crop')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      data-testid="select-field-crop"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите культуру" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cropTypes.map((crop) => (
                          <SelectItem key={crop.value} value={crop.value}>
                            {crop.label[language as keyof typeof crop.label] || crop.label.ru}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  data-testid="button-cancel"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? t('common.loading') : t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Анализ поля завершен</DialogTitle>
            <DialogDescription>
              Результаты анализа и рекомендации для вашего поля
            </DialogDescription>
          </DialogHeader>

          {analysisResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                    Краткая оценка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                </CardContent>
              </Card>

              {analysisResult.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Рекомендации
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <Badge variant="outline" className="mt-0.5 shrink-0">
                            {i + 1}
                          </Badge>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysisResult.yieldOptimization.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      Оптимизация урожая
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.yieldOptimization.map((opt, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-purple-500">•</span>
                          <span>{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysisResult.risks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Риски
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.risks.map((risk, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-yellow-500">⚠</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    График работ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{analysisResult.timeline}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowAnalysis(false)}>
              Понятно
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

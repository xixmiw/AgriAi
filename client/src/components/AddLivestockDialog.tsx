import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { insertLivestockSchema, type InsertLivestock } from '@shared/schema';
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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Apple, Clock, Lightbulb } from 'lucide-react';

interface LivestockFeedingPlan {
  summary: string;
  dailyFeed: {
    ingredient: string;
    percentage: number;
    amountPerAnimal: string;
    totalAmount?: string;
    cost?: string;
  }[];
  feedingSchedule: string[];
  nutritionTips: string[];
  costSavings: string[];
}

interface AddLivestockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const livestockTypes = [
  { value: 'dairy_cattle', label: { en: 'Dairy Cattle', ru: 'Молочные коровы', kk: 'Сүт сиырлары' } },
  { value: 'beef_cattle', label: { en: 'Beef Cattle', ru: 'Мясные коровы', kk: 'Ет сиырлары' } },
  { value: 'sheep', label: { en: 'Sheep', ru: 'Овцы', kk: 'Қойлар' } },
  { value: 'goats', label: { en: 'Goats', ru: 'Козы', kk: 'Ешкілер' } },
  { value: 'horses', label: { en: 'Horses', ru: 'Лошади', kk: 'Жылқылар' } },
  { value: 'pigs', label: { en: 'Pigs', ru: 'Свиньи', kk: 'Шошқалар' } },
  { value: 'chickens', label: { en: 'Chickens', ru: 'Куры', kk: 'Тауықтар' } },
];

export default function AddLivestockDialog({ open, onOpenChange }: AddLivestockDialogProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [feedingPlan, setFeedingPlan] = useState<LivestockFeedingPlan | null>(null);
  const [showFeedingPlan, setShowFeedingPlan] = useState(false);

  const form = useForm<Omit<InsertLivestock, 'userId'>>({
    resolver: zodResolver(insertLivestockSchema.omit({ userId: true })),
    defaultValues: {
      type: 'dairy_cattle',
      count: 10,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<InsertLivestock, 'userId'>) => {
      const res = await apiRequest('POST', '/api/livestock', data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/livestock'] });
      if (data.feedingPlan) {
        setFeedingPlan(data.feedingPlan);
        setShowFeedingPlan(true);
      }
      toast({
        title: 'Успешно',
        description: 'Группа скота добавлена успешно',
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message || 'Не удалось добавить скот',
      });
    },
  });

  const onSubmit = (data: Omit<InsertLivestock, 'userId'>) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent data-testid="dialog-add-livestock">
          <DialogHeader>
            <DialogTitle>{t('livestock.addNew')}</DialogTitle>
            <DialogDescription>
              Добавьте информацию о группе животных для AI-анализа
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('livestock.type')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      data-testid="select-livestock-type"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {livestockTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label[language as keyof typeof type.label] || type.label.ru}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('livestock.count')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-livestock-count"
                      />
                    </FormControl>
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

      <Dialog open={showFeedingPlan} onOpenChange={setShowFeedingPlan}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>План кормления готов</DialogTitle>
            <DialogDescription>
              AI сгенерировал персонализированный план кормления
            </DialogDescription>
          </DialogHeader>

          {feedingPlan && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Apple className="h-4 w-4 text-green-500" />
                    Состав рациона
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedingPlan.dailyFeed.map((feed, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{feed.ingredient}</span>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{feed.percentage}%</Badge>
                              <span className="text-muted-foreground text-xs">
                                {feed.amountPerAnimal}
                              </span>
                            </div>
                            {feed.totalAmount && (
                              <span className="text-xs font-medium text-green-600">
                                {feed.totalAmount}
                              </span>
                            )}
                          </div>
                        </div>
                        <Progress value={feed.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {feedingPlan.feedingSchedule.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-4 w-4 text-blue-500" />
                      График кормления
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedingPlan.feedingSchedule.map((schedule, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{schedule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {feedingPlan.nutritionTips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Советы по питанию
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedingPlan.nutritionTips.map((tip, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-yellow-500">💡</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {feedingPlan.costSavings && feedingPlan.costSavings.length > 0 && (
                <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-green-700 dark:text-green-400">
                      💰 Экономия и альтернативы
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedingPlan.costSavings.map((saving, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-green-600 dark:text-green-400">💵</span>
                          <span className="text-green-800 dark:text-green-200 font-medium">{saving}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowFeedingPlan(false)}>
              Понятно
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

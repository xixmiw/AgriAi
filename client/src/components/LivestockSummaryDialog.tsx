import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, AreaChart, Area, CartesianGrid } from 'recharts';
import { Loader2, Heart, UtensilsCrossed, Activity } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface LivestockSummaryDialogProps {
  livestockId: string;
  type: string;
  count: number;
  healthStats: {
    healthy: number;
    warning: number;
    critical: number;
    dead: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FeedingPlan {
  dailyFeed: Array<{
    ingredient: string;
    percentage: number;
    amountPerAnimal: string;
    totalAmount: string;
  }>;
  schedule: string[];
  savings: string[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
const HEALTH_COLORS = {
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  dead: '#6b7280',
};

export default function LivestockSummaryDialog({
  livestockId,
  type,
  count,
  healthStats,
  open,
  onOpenChange,
}: LivestockSummaryDialogProps) {
  const { toast } = useToast();
  const [feedingPlan, setFeedingPlan] = useState<FeedingPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFeedingPlan(null);
  }, [livestockId]);

  useEffect(() => {
    if (open && !feedingPlan) {
      fetchFeedingPlan();
    }
  }, [open, feedingPlan, livestockId]);

  const fetchFeedingPlan = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('POST', `/api/livestock/${livestockId}/feeding-plan`);
      const data = await res.json();
      setFeedingPlan(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message || 'Не удалось загрузить план кормления',
      });
    } finally {
      setLoading(false);
    }
  };

  const healthChartData = [
    { name: 'Здоровы', value: healthStats.healthy, color: HEALTH_COLORS.healthy },
    { name: 'Внимание', value: healthStats.warning, color: HEALTH_COLORS.warning },
    { name: 'Болен', value: healthStats.critical, color: HEALTH_COLORS.critical },
    { name: 'Мертв', value: healthStats.dead, color: HEALTH_COLORS.dead },
  ].filter(item => item.value > 0);

  const feedingChartData = feedingPlan?.dailyFeed.map(item => ({
    name: item.ingredient,
    value: item.percentage,
  })) || [];

  const vitalsTrendData = Array.from({ length: 7 }, (_, i) => ({
    day: `День ${i + 1}`,
    temp: 38.5 + Math.random() * 0.5,
    heartRate: 67 + Math.random() * 6,
    activity: 85 + Math.random() * 10,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            Сводка: {type}
          </DialogTitle>
          <DialogDescription>
            Всего: <Badge variant="secondary">{count} голов</Badge> • Здоровье и кормление
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="health" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Здоровье
              </TabsTrigger>
              <TabsTrigger value="feeding" className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Кормление
              </TabsTrigger>
              <TabsTrigger value="vitals" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Показатели
              </TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="space-y-4 mt-4">
              <Card className="border-2 border-green-200 dark:border-green-900">
                <CardHeader>
                  <CardTitle className="text-lg">Распределение по здоровью</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <ChartContainer
                        config={{}}
                        className="h-[250px] w-full"
                      >
                        <PieChart>
                          <Pie
                            data={healthChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {healthChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                    <div className="flex flex-col justify-center space-y-4">
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500">
                        <div className="text-3xl font-bold text-green-600">{healthStats.healthy}</div>
                        <div className="text-sm text-muted-foreground">Здоровых животных</div>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-500">
                        <div className="text-3xl font-bold text-yellow-600">{healthStats.warning}</div>
                        <div className="text-sm text-muted-foreground">Требуют внимания</div>
                      </div>
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500">
                        <div className="text-3xl font-bold text-red-600">{healthStats.critical}</div>
                        <div className="text-sm text-muted-foreground">В критическом состоянии</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feeding" className="space-y-4 mt-4">
              <Card className="border-2 border-orange-200 dark:border-orange-900">
                <CardHeader>
                  <CardTitle className="text-lg">План кормления</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {feedingChartData.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-3">Состав рациона</h3>
                        <ChartContainer
                          config={{}}
                          className="h-[200px] w-full"
                        >
                          <PieChart>
                            <Pie
                              data={feedingChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {feedingChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ChartContainer>
                      </div>
                      <div>
                        <h3 className="font-medium mb-3">Количество на животное</h3>
                        <ChartContainer
                          config={{
                            value: { label: 'Проценты', color: '#f59e0b' },
                          }}
                          className="h-[200px] w-full"
                        >
                          <BarChart data={feedingChartData}>
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="font-medium">Детали кормления</h3>
                    {feedingPlan?.dailyFeed.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{item.percentage}%</Badge>
                          <span className="font-medium">{item.ingredient}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.amountPerAnimal}</span>
                      </div>
                    ))}
                  </div>

                  {feedingPlan?.schedule && feedingPlan.schedule.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">График кормления</h3>
                      {feedingPlan.schedule.map((item, i) => (
                        <div key={i} className="flex gap-2 text-sm p-2 rounded bg-blue-50 dark:bg-blue-950/30">
                          <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {feedingPlan?.savings && feedingPlan.savings.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Советы по экономии</h3>
                      {feedingPlan.savings.map((item, i) => (
                        <div key={i} className="flex gap-2 text-sm p-2 rounded bg-green-50 dark:bg-green-950/30">
                          <Badge variant="outline" className="shrink-0">💡</Badge>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vitals" className="space-y-4 mt-4">
              <Card className="border-2 border-blue-200 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-lg">Тренды показателей (7 дней)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Температура тела</h3>
                    <ChartContainer
                      config={{
                        temp: { label: 'Температура °C', color: '#ef4444' },
                      }}
                      className="h-[150px] w-full"
                    >
                      <AreaChart data={vitalsTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[37, 40]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="temp" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                      </AreaChart>
                    </ChartContainer>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Пульс</h3>
                    <ChartContainer
                      config={{
                        heartRate: { label: 'Уд/мин', color: '#ec4899' },
                      }}
                      className="h-[150px] w-full"
                    >
                      <AreaChart data={vitalsTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[60, 75]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="heartRate" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                      </AreaChart>
                    </ChartContainer>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Активность</h3>
                    <ChartContainer
                      config={{
                        activity: { label: 'Активность %', color: '#3b82f6' },
                      }}
                      className="h-[150px] w-full"
                    >
                      <AreaChart data={vitalsTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[80, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="activity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

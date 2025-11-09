import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Loader2, Sprout, FlaskConical, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FieldSummaryDialogProps {
  fieldId: string;
  fieldName: string;
  crop: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Recommendations {
  title: string;
  recommendations: string[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function FieldSummaryDialog({
  fieldId,
  fieldName,
  crop,
  open,
  onOpenChange,
}: FieldSummaryDialogProps) {
  const { toast } = useToast();
  const [fertilizerData, setFertilizerData] = useState<Recommendations | null>(null);
  const [soilData, setSoilData] = useState<Recommendations | null>(null);
  const [pesticidesData, setPesticidesData] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !fertilizerData && !soilData && !pesticidesData) {
      fetchAllRecommendations();
    }
  }, [open]);

  const fetchAllRecommendations = async () => {
    setLoading(true);
    try {
      const [fert, soil, pest] = await Promise.all([
        apiRequest('GET', `/api/fields/${fieldId}/recommendations/fertilizer`).then(r => r.json()),
        apiRequest('GET', `/api/fields/${fieldId}/recommendations/soil`).then(r => r.json()),
        apiRequest('GET', `/api/fields/${fieldId}/recommendations/pesticides`).then(r => r.json()),
      ]);
      setFertilizerData(fert);
      setSoilData(soil);
      setPesticidesData(pest);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message || 'Не удалось загрузить рекомендации',
      });
    } finally {
      setLoading(false);
    }
  };

  const fertilizerChartData = fertilizerData?.recommendations.slice(0, 5).map((rec, i) => ({
    name: `Пункт ${i + 1}`,
    value: 100 - i * 15,
    label: rec.substring(0, 30) + '...',
  })) || [];

  const soilChartData = soilData?.recommendations.slice(0, 6).map((rec, i) => ({
    metric: rec.split(':')[0] || `Метрика ${i + 1}`,
    value: 80 - i * 10,
  })) || [];

  const pesticidesChartData = pesticidesData?.recommendations.slice(0, 4).map((rec, i) => ({
    name: rec.split('.')[0] || `Пестицид ${i + 1}`,
    value: Math.floor(20 + Math.random() * 30),
  })) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            Полная сводка: {fieldName}
          </DialogTitle>
          <DialogDescription>
            Культура: <Badge variant="secondary">{crop}</Badge> • Все рекомендации с визуализацией
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="fertilizer" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fertilizer" className="flex items-center gap-2">
                <Sprout className="h-4 w-4" />
                Удобрения
              </TabsTrigger>
              <TabsTrigger value="soil" className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Почва
              </TabsTrigger>
              <TabsTrigger value="pesticides" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Защита
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fertilizer" className="space-y-4 mt-4">
              <Card className="border-2 border-green-200 dark:border-green-900">
                <CardHeader>
                  <CardTitle className="text-lg">План удобрений</CardTitle>
                </CardHeader>
                <CardContent>
                  {fertilizerChartData.length > 0 && (
                    <ChartContainer
                      config={{
                        value: { label: 'Приоритет', color: '#10b981' },
                      }}
                      className="h-[200px] w-full"
                    >
                      <BarChart data={fertilizerChartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  )}
                  <div className="mt-6 space-y-3">
                    {fertilizerData?.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500">
                        <Badge variant="outline" className="shrink-0 h-6">{i + 1}</Badge>
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="soil" className="space-y-4 mt-4">
              <Card className="border-2 border-blue-200 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-lg">Анализ почвы</CardTitle>
                </CardHeader>
                <CardContent>
                  {soilChartData.length > 0 && (
                    <ChartContainer
                      config={{
                        value: { label: 'Показатель', color: '#3b82f6' },
                      }}
                      className="h-[250px] w-full"
                    >
                      <RadarChart data={soilChartData}>
                        <PolarGrid stroke="#94a3b8" />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Качество" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RadarChart>
                    </ChartContainer>
                  )}
                  <div className="mt-6 space-y-3">
                    {soilData?.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500">
                        <Badge variant="outline" className="shrink-0 h-6">{i + 1}</Badge>
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pesticides" className="space-y-4 mt-4">
              <Card className="border-2 border-orange-200 dark:border-orange-900">
                <CardHeader>
                  <CardTitle className="text-lg">План защиты урожая</CardTitle>
                </CardHeader>
                <CardContent>
                  {pesticidesChartData.length > 0 && (
                    <ChartContainer
                      config={{}}
                      className="h-[200px] w-full"
                    >
                      <PieChart>
                        <Pie
                          data={pesticidesChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pesticidesChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  )}
                  <div className="mt-6 space-y-3">
                    {pesticidesData?.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500">
                        <Badge variant="outline" className="shrink-0 h-6">{i + 1}</Badge>
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
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

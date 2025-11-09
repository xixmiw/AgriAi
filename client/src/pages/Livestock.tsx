import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Thermometer, Zap, AlertCircle, Plus, Sprout, BarChart3 } from 'lucide-react';
import AddLivestockDialog from '@/components/AddLivestockDialog';
import LivestockSummaryDialog from '@/components/LivestockSummaryDialog';
import type { Livestock } from '@shared/schema';

interface Animal {
  id: string;
  name: string;
  tag: string;
  health: 'healthy' | 'warning' | 'critical' | 'dead';
  temperature: number;
  heartRate: number;
  activity: number;
}

function generateAnimalsForType(type: string, count: number): Animal[] {
  const animals: Animal[] = [];
  const baseTemps: Record<string, number> = {
    'Коровы': 38.5,
    'Быки': 38.7,
    'Козы': 39.0,
    'Свиньи': 39.2,
    'Овцы': 39.0,
  };
  const baseHeartRates: Record<string, number> = {
    'Коровы': 67,
    'Быки': 70,
    'Козы': 82,
    'Свиньи': 74,
    'Овцы': 85,
  };
  
  const baseTemp = baseTemps[type] || 38.5;
  const baseHR = baseHeartRates[type] || 70;
  
  for (let i = 0; i < count; i++) {
    let health: 'healthy' | 'warning' | 'critical' | 'dead' = 'healthy';
    let temp = baseTemp + (Math.random() * 0.4 - 0.2);
    let hr = baseHR + Math.floor(Math.random() * 6 - 3);
    let activity = 85 + Math.floor(Math.random() * 10);
    
    if (count >= 3 && i === count - 3) {
      health = 'warning';
      temp = baseTemp + 0.7 + Math.random() * 0.5;
      hr = baseHR + 10 + Math.floor(Math.random() * 5);
      activity = 60 + Math.floor(Math.random() * 10);
    } else if (count >= 2 && i === count - 2) {
      health = 'critical';
      temp = baseTemp + 1.5 + Math.random() * 0.5;
      hr = baseHR + 25 + Math.floor(Math.random() * 10);
      activity = 35 + Math.floor(Math.random() * 15);
    } else if (i === count - 1) {
      health = 'dead';
      temp = Math.round((15 + Math.random() * 3) * 10) / 10;
      hr = 0;
      activity = 0;
    }
    
    const prefix = type === 'Коровы' ? 'C' : 
                   type === 'Быки' ? 'B' : 
                   type === 'Козы' ? 'G' : 
                   type === 'Свиньи' ? 'P' : 'S';
    
    animals.push({
      id: `${prefix}-${i + 1}`,
      name: `${type.slice(0, -1)}а #${100 * (animals.length + 1) + i + 1}`,
      tag: `${prefix}-${100 + i + 1}`,
      health,
      temperature: Math.round(temp * 10) / 10,
      heartRate: hr,
      activity,
    });
  }
  
  return animals;
}

function AnimalCard({ animal }: { animal: Animal }) {
  const borderColor = 
    animal.health === 'dead' ? 'border-gray-900 dark:border-gray-500 border-2 bg-gray-100 dark:bg-gray-900' :
    animal.health === 'critical' ? 'border-red-500 border-2' :
    animal.health === 'warning' ? 'border-yellow-500 border-2' :
    'border-gray-200';

  return (
    <Card className={`${borderColor} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{animal.name}</CardTitle>
          <Badge 
            variant={
              animal.health === 'dead' ? 'destructive' :
              animal.health === 'critical' ? 'destructive' : 
              animal.health === 'warning' ? 'secondary' : 
              'default'
            }
            className="flex items-center gap-1"
          >
            {animal.health === 'dead' && <AlertCircle className="h-3 w-3" />}
            {animal.health === 'critical' && <AlertCircle className="h-3 w-3" />}
            {animal.health === 'warning' && <AlertCircle className="h-3 w-3" />}
            {animal.health === 'healthy' ? 'Здоров' : 
             animal.health === 'warning' ? 'Возможно болен' : 
             animal.health === 'critical' ? 'Болен' : 'Мертв'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Метка: {animal.tag}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            Температура
          </span>
          <span className={`font-medium ${animal.health === 'dead' ? 'text-muted-foreground' : ''}`}>
            {animal.temperature}°C
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Heart className={`h-4 w-4 ${animal.health === 'dead' ? 'text-gray-400' : 'text-red-500'}`} />
            Пульс
          </span>
          <span className={`font-medium ${animal.health === 'dead' ? 'text-muted-foreground' : ''}`}>
            {animal.heartRate > 0 ? `${animal.heartRate} уд/мин` : 'Нет'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            Активность
          </span>
          <span className={`font-medium ${animal.health === 'dead' ? 'text-muted-foreground' : ''}`}>
            {animal.activity}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LivestockPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('cows');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedLivestock, setSelectedLivestock] = useState<{ id: string; type: string; count: number; stats: any } | null>(null);

  const { data: livestock = [], isLoading } = useQuery<Livestock[]>({
    queryKey: ['/api/livestock'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  const typeMapping: Record<string, { display: string; tabValue: string }> = {
    'dairy_cattle': { display: 'Коровы', tabValue: 'cows' },
    'beef_cattle': { display: 'Коровы', tabValue: 'cows' },
    'bulls': { display: 'Быки', tabValue: 'bulls' },
    'goats': { display: 'Козы', tabValue: 'goats' },
    'pigs': { display: 'Свиньи', tabValue: 'pigs' },
    'sheep': { display: 'Овцы', tabValue: 'sheep' },
    'horses': { display: 'Лошади', tabValue: 'horses' },
    'chickens': { display: 'Куры', tabValue: 'chickens' },
  };

  const groupedByDisplay = livestock.reduce((acc, item) => {
    const mapped = typeMapping[item.type];
    if (!mapped) return acc;
    
    const displayType = mapped.display;
    if (!acc[displayType]) {
      acc[displayType] = [];
    }
    acc[displayType].push(item);
    return acc;
  }, {} as Record<string, Livestock[]>);

  const availableTypes = Object.keys(groupedByDisplay);

  if (livestock.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8 text-green-600" />
              IoT Мониторинг Животных
            </h1>
            <p className="text-muted-foreground mt-1">
              Система датчиков в реальном времени для отслеживания здоровья скота
            </p>
          </div>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              Нет добавленных животных
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Добавьте информацию о вашем скоте (коровы, овцы, быки и т.д.). 
              После добавления AI сгенерирует план кормления, а IoT система начнет отслеживать здоровье каждого животного.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить первую группу
            </Button>
          </CardContent>
        </Card>

        <AddLivestockDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />

        <footer className="text-center text-sm text-gray-500 pt-8 pb-4">
          © 2025 No Vibe Coding. Все права защищены.
        </footer>
      </div>
    );
  }

  const simulatedAnimals: Record<string, Animal[]> = {};
  const stats: Record<string, { total: number; healthy: number; warning: number; critical: number; dead: number }> = {};
  
  availableTypes.forEach(displayType => {
    const totalCount = groupedByDisplay[displayType].reduce((sum, l) => sum + l.count, 0);
    const animals = generateAnimalsForType(displayType, totalCount);
    
    const sortedAnimals = animals.sort((a, b) => {
      const healthOrder = { 'dead': 0, 'critical': 1, 'warning': 2, 'healthy': 3 };
      return healthOrder[a.health] - healthOrder[b.health];
    });
    
    simulatedAnimals[displayType] = sortedAnimals;
    
    const tabValue = typeMapping[groupedByDisplay[displayType][0].type].tabValue;
    stats[tabValue] = {
      total: animals.length,
      healthy: animals.filter(a => a.health === 'healthy').length,
      warning: animals.filter(a => a.health === 'warning').length,
      critical: animals.filter(a => a.health === 'critical').length,
      dead: animals.filter(a => a.health === 'dead').length,
    };
  });

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg1OSwgMTMwLCAyNDYsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              <Zap className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-pulse" />
              IoT Мониторинг Животных
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              📡 Система датчиков в реальном времени для отслеживания здоровья скота
            </p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить животных
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableTypes.length}, minmax(0, 1fr))` }}>
          {availableTypes.map(displayType => {
            const firstItem = groupedByDisplay[displayType][0];
            const tabValue = typeMapping[firstItem.type].tabValue;
            const stat = stats[tabValue] || { total: 0, healthy: 0 };
            return (
              <TabsTrigger key={displayType} value={tabValue} className="flex flex-col gap-1 py-3">
                <span>{displayType}</span>
                <span className="text-xs text-muted-foreground">{stat.healthy}/{stat.total}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {availableTypes.map(displayType => {
          const firstItem = groupedByDisplay[displayType][0];
          const tabValue = typeMapping[firstItem.type].tabValue;
          const animals = simulatedAnimals[displayType] || [];
          const stat = stats[tabValue] || { total: 0, healthy: 0, warning: 0, critical: 0, dead: 0 };
          return (
            <TabsContent key={displayType} value={tabValue} className="space-y-4 mt-6">
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-lg">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-5 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stat.healthy}</div>
                      <div className="text-xs text-muted-foreground mt-1">Здоровы</div>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
                      <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stat.warning}</div>
                      <div className="text-xs text-muted-foreground mt-1">Возможно болен</div>
                    </div>
                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stat.critical}</div>
                      <div className="text-xs text-muted-foreground mt-1">Болен</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-700">
                      <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stat.dead}</div>
                      <div className="text-xs text-muted-foreground mt-1">Мертв</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-400 dark:border-blue-600">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stat.total}</div>
                      <div className="text-xs text-muted-foreground mt-1">Всего</div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={() => {
                        setSelectedLivestock({
                          id: groupedByDisplay[displayType][0].id,
                          type: displayType,
                          count: stat.total,
                          stats: {
                            healthy: stat.healthy,
                            warning: stat.warning,
                            critical: stat.critical,
                            dead: stat.dead,
                          },
                        });
                        setSummaryOpen(true);
                      }}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Полная сводка по кормлению
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {animals.map((animal) => (
                  <AnimalCard key={animal.id} animal={animal} />
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <AddLivestockDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {selectedLivestock && (
        <LivestockSummaryDialog
          livestockId={selectedLivestock.id}
          type={selectedLivestock.type}
          count={selectedLivestock.count}
          healthStats={selectedLivestock.stats}
          open={summaryOpen}
          onOpenChange={setSummaryOpen}
        />
      )}

      <footer className="text-center text-sm text-gray-500 pt-8 pb-4">
        © 2025 No Vibe Coding. Все права защищены.
      </footer>
    </div>
  );
}

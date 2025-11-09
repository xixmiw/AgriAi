import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserStatsCard() {
  const { user } = useAuth();
  
  const getRoleIcon = () => {
    switch (user?.role) {
      case 'farmer':
        return '🌾';
      case 'agronomist':
        return '🔬';
      case 'veterinarian':
        return '🩺';
      case 'manager':
        return '📊';
      default:
        return '👤';
    }
  };

  const stats = [
    {
      label: 'Дней в системе',
      value: '12',
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      label: 'Активность',
      value: '87%',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      label: 'Выполнено задач',
      value: '24',
      icon: Target,
      color: 'text-purple-600',
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{getRoleIcon()}</span>
          <div>
            <div className="text-lg">Статистика пользователя</div>
            <div className="text-sm opacity-90">{user?.fullName || user?.username}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

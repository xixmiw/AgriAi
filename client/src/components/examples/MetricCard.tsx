import MetricCard from '../MetricCard';
import { Wheat } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="p-4 max-w-xs">
      <MetricCard
        title="Total Fields"
        value={12}
        icon={Wheat}
        trend="+2 this month"
        testId="metric-example"
      />
    </div>
  );
}

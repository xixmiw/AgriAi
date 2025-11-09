import LivestockCard from '../LivestockCard';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function LivestockCardExample() {
  return (
    <LanguageProvider>
      <div className="p-4 max-w-xs">
        <LivestockCard
          id="1"
          type="Dairy Cattle"
          count={87}
          healthStatus="healthy"
          testId="livestock-example"
        />
      </div>
    </LanguageProvider>
  );
}

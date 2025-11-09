import FieldCard from '../FieldCard';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function FieldCardExample() {
  return (
    <LanguageProvider>
      <div className="p-4 max-w-sm">
        <FieldCard
          id="1"
          name="North Field"
          area={45}
          crop="Wheat"
          location="51.1694°N, 71.4491°E"
          status="healthy"
          testId="field-example"
        />
      </div>
    </LanguageProvider>
  );
}

import LanguageSelector from '../LanguageSelector';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function LanguageSelectorExample() {
  return (
    <LanguageProvider>
      <div className="p-4">
        <LanguageSelector />
      </div>
    </LanguageProvider>
  );
}

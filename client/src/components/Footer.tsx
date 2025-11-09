import { FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="text-center text-sm text-muted-foreground pt-8 pb-4 border-t mt-auto">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span>© 2025 No Vibe Coding. Все права защищены.</span>
        </div>
        <a 
          href="https://wa.me/77088118796" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
        >
          <FaWhatsapp className="h-5 w-5" />
          <span>+7 708 811 87 96</span>
        </a>
      </div>
    </footer>
  );
}

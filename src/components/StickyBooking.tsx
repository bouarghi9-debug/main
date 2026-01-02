import { Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function StickyBooking() {
  const { t } = useLanguage();

  return (
    <a
      href="https://prime-cutz.setmore.com"
      target="_blank"
      rel="noopener noreferrer"
      className="hidden md:flex fixed bottom-8 right-8 bg-[#D4AF37] text-black px-6 py-3 rounded-full font-bold shadow-xl hover:bg-yellow-600 transition-all duration-300 transform hover:scale-110 items-center gap-2"
    >
      <Calendar className="w-5 h-5" />
      {t('location.bookAppointment')}
    </a>
  );
}

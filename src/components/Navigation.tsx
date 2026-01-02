import { Scissors, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type Page = 'home' | 'services' | 'barbers' | 'location';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems: { key: string; page: Page }[] = [
    { key: 'nav.home', page: 'home' },
    { key: 'nav.services', page: 'services' },
    { key: 'nav.barbers', page: 'barbers' },
    { key: 'nav.location', page: 'location' },
  ];

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setIsOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <nav className="fixed top-4 left-0 right-0 z-50">
      <div className="relative max-w-7xl mx-auto px-4">
        <img
          src="/image copy copy copy.png"
          alt="Prime Cutz Logo"
          className="absolute left-4 top-0 w-24 sm:w-28 opacity-95 cursor-pointer"
          onClick={() => handleNavClick('home')}
        />
        <div className="bg-black/80 backdrop-blur-xl rounded-full border border-[#D4AF37]/30 shadow-2xl px-8 py-3 w-[95%] max-w-4xl mx-auto">
        <div className="flex items-center justify-center">
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex gap-8">
              {navItems.map((item) => (
                <li key={item.page}>
                  <button
                    onClick={() => handleNavClick(item.page)}
                    className={`font-semibold text-base tracking-wide transition-colors duration-300 uppercase ${
                      currentPage === item.page
                        ? 'gold-text'
                        : 'text-gray-300 gold-hover'
                    }`}
                  >
                    {t(item.key)}
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={toggleLanguage}
              className="px-4 py-1.5 text-xs font-bold border border-[#D4AF37] text-[#D4AF37] rounded-full hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            >
              {language === 'en' ? 'FR' : 'ENG'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3 w-full justify-between">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 text-xs font-bold border border-[#D4AF37] text-[#D4AF37] rounded-full hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            >
              {language === 'en' ? 'FR' : 'ENG'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:gold-text transition"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <ul className="md:hidden mt-3 pt-3 border-t border-[#D4AF37]/20 space-y-1">
            {navItems.map((item) => (
              <li key={item.page}>
                <button
                  onClick={() => handleNavClick(item.page)}
                  className={`block w-full text-left py-2 font-medium text-sm transition-colors duration-300 ${
                    currentPage === item.page
                      ? 'gold-text'
                      : 'text-gray-300 gold-hover'
                  }`}
                >
                  {t(item.key)}
                </button>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </nav>
  );
}

import { useState } from 'react';
import { AlertTriangle, Languages } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useLanguage } from '../contexts/LanguageContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface TermsModalProps {
  onAgree: () => void;
}

export default function TermsModal({ onAgree }: TermsModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAgreeing, setIsAgreeing] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercentage =
      (element.scrollTop + element.clientHeight) / element.scrollHeight;

    if (scrollPercentage > 0.95) {
      setHasScrolled(true);
    }
  };

  const handleAgree = async () => {
    setIsAgreeing(true);

    try {
      const userAgent = navigator.userAgent;

      const { error } = await supabase
        .from('terms_agreements')
        .insert([
          {
            ip_address: 'browser_session',
            user_agent: userAgent,
            agreed_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Error recording agreement:', error);
      }

      localStorage.setItem('primecuts_terms_agreed', 'true');
      localStorage.setItem('primecuts_terms_timestamp', new Date().toISOString());

      onAgree();
    } catch (error) {
      console.error('Failed to record agreement:', error);
      onAgree();
    } finally {
      setIsAgreeing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border-2 border-[#D4AF37] rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#D4AF37]/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-[#D4AF37]" />
              <h2 className="text-2xl font-bold gold-text">{t('terms.title')}</h2>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg transition-colors"
            >
              <Languages className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-medium text-sm">{language === 'en' ? 'FR' : 'EN'}</span>
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            {t('terms.subtitle')}
          </p>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4 text-gray-300 text-sm leading-relaxed"
          onScroll={handleScroll}
        >
          <section>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-2">{t('terms.section1Title')}</h3>
            <p>{t('terms.section1Content')}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-2">{t('terms.section2Title')}</h3>
            <p className="mb-2">{t('terms.section2Intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{t('terms.section2Item1')}</li>
              <li>{t('terms.section2Item2')}</li>
              <li>{t('terms.section2Item3')}</li>
              <li>{t('terms.section2Item4')}</li>
              <li>{t('terms.section2Item5')}</li>
              <li>{t('terms.section2Item6')}</li>
            </ul>
            <p className="mt-2">{t('terms.section2Outro')}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-2">{t('terms.section3Title')}</h3>
            <p className="mb-2">{t('terms.section3Intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{t('terms.section3Item1')}</li>
              <li>{t('terms.section3Item2')}</li>
              <li>{t('terms.section3Item3')}</li>
              <li>{t('terms.section3Item4')}</li>
              <li>{t('terms.section3Item5')}</li>
              <li>{t('terms.section3Item6')}</li>
              <li>{t('terms.section3Item7')}</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-2">{t('terms.section4Title')}</h3>
            <p>{t('terms.section4Content')}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-2">{t('terms.section5Title')}</h3>
            <p>{t('terms.section5Content')}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-2">{t('terms.section6Title')}</h3>
            <p>{t('terms.section6Content')}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-2">{t('terms.section7Title')}</h3>
            <p>{t('terms.section7Content')}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#D4AF37] mb-2">{t('terms.section8Title')}</h3>
            <p>{t('terms.section8Content')}</p>
          </section>

          <section className="pt-4 border-t border-[#D4AF37]/30">
            <p className="text-xs text-gray-500">
              {t('terms.lastUpdated')}<br />
              {t('terms.copyright')}
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#D4AF37]/30 bg-[#0A0A0A]">
          <button
            onClick={handleAgree}
            disabled={!hasScrolled || isAgreeing}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              hasScrolled && !isAgreeing
                ? 'bg-[#D4AF37] text-black hover:bg-[#F5C451] cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAgreeing ? t('terms.recording') : hasScrolled ? t('terms.agree') : t('terms.pleaseRead')}
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">
            {t('terms.trackingNote')}
          </p>
        </div>
      </div>
    </div>
  );
}

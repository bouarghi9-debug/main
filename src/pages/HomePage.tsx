import { ArrowRight, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type Page = 'home' | 'services' | 'barbers' | 'location';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const vibeImages = [
  { src: '/gallery/8dbfbdfc-3ccf-43a5-befb-1b2cbe57a698_(1).png' },
  { src: '/gallery/793394d2-fd80-48af-9d39-a9d9884ca63b_(1).png' },
  { src: '/gallery/543b8d07-432f-4bea-abe2-d0dccfc35143_(1).png' },
  { src: '/gallery/6019f4fb-397f-4ba8-a777-509046e2377f_(1).png' },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useLanguage();

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#0F0F0F]">
        <div className="absolute inset-0">
          <img
            src="/6fad79df-8874-47ab-b8d7-544c1d7444e1_(1).jpg"
            alt="Prime Cutz Barbershop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
            <span className="text-[#F5F5F5]">{t('hero.title1')}</span>
            <br />
            <span className="text-[#D4AF37]">{t('hero.title2')}</span>
          </h1>
          <p className="text-xl sm:text-2xl text-[#D4AF37] mb-4 font-medium italic tracking-wide">
            "{t('hero.caption')}"
          </p>
          <p className="text-base sm:text-lg text-[#A1A1A1] mb-10 leading-relaxed max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://prime-cutz.setmore.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-btn-primary flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              {t('hero.bookNow')}
            </a>
            <button
              onClick={() => onNavigate('services')}
              className="hero-btn-secondary flex items-center justify-center gap-2"
            >
              {t('hero.viewServices')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Vibe Gallery */}
      <section className="py-20 px-4 bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#D4AF37] mb-4 text-center">{t('vibe.title')}</h2>
          <p className="text-[#A1A1A1] text-center mb-12">{t('vibe.subtitle')}</p>

          <div className="grid grid-cols-2 gap-6">
            {vibeImages.map((image, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden aspect-square rounded-2xl"
              >
                <img
                  src={image.src}
                  alt={`Vibe ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 bg-[#1A1A1A]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#D4AF37] mb-12 text-center">{t('story.title')}</h2>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative overflow-hidden rounded-2xl aspect-[4/3] lg:aspect-auto lg:h-[600px]">
              <img
                src="/gallery/543b8d07-432f-4bea-abe2-d0dccfc35143_(1).png"
                alt="Prime Cutz Barbershop Interior"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="space-y-6 text-[#F5F5F5] leading-relaxed">
                <p>{t('story.p1')}</p>
                <p>{t('story.p2')}</p>
                <p>{t('story.p3')}</p>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-4">
                <div className="border-l-2 border-[#D4AF37] pl-4">
                  <div className="text-3xl font-bold text-[#D4AF37]">10+</div>
                  <div className="text-sm text-[#A1A1A1]">{t('story.stat1')}</div>
                </div>
                <div className="border-l-2 border-[#D4AF37] pl-4">
                  <div className="text-3xl font-bold text-[#D4AF37]">5K+</div>
                  <div className="text-sm text-[#A1A1A1]">{t('story.stat2')}</div>
                </div>
                <div className="border-l-2 border-[#D4AF37] pl-4">
                  <div className="text-3xl font-bold text-[#D4AF37]">4.9★</div>
                  <div className="text-sm text-[#A1A1A1]">{t('story.stat3')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

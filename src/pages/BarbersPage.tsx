import { Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function BarbersPage() {
  const { t } = useLanguage();

  const barbers = [
    {
      id: 1,
      name: 'Muhammed',
      specialtyKey: 'barbers.specialty1',
      image: '/gallery/files_6492453-1767358402304-chatgpt_image_jan_2,_2026,_07_50_02_am.png',
      rating: 4.9,
      experience: '5',
    },
    {
      id: 2,
      name: 'Baha',
      specialtyKey: 'barbers.specialty2',
      image: '/gallery/files_6492453-1767358404591-chatgpt_image_jan_2,_2026,_07_50_03_am.png',
      rating: 5.0,
      experience: '7',
    },
    {
      id: 3,
      name: 'Ali',
      specialtyKey: 'barbers.specialty3',
      image: '/gallery/files_6492453-1767358406792-chatgpt_image_jan_2,_2026,_07_50_01_am.png',
      rating: 4.8,
      experience: '4',
    },
  ];

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold gold-text mb-4">{t('barbers.title')}</h1>
          <p className="text-gray-400 text-lg">{t('barbers.subtitle')}</p>
        </div>

        {/* Barbers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-lg overflow-hidden"
            >
              {/* Image */}
              <div className="relative overflow-hidden h-64 sm:h-72">
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>

              {/* Info */}
              <div className="p-6 relative -mt-20 z-10">
                <h3 className="text-2xl font-bold text-gray-100 mb-1">{barber.name}</h3>
                <p className="text-[#D4AF37] text-sm font-medium mb-3">{t(barber.specialtyKey)}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]"
                      />
                    ))}
                    <span className="text-sm text-gray-400 ml-2">{barber.rating}</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {barber.experience} {t('common.years')} {t('barbers.experience')}
                  </p>
                </div>

                <button className="w-full bg-[#D4AF37] text-black py-2 rounded font-semibold text-sm">
                  {t('barbers.bookWith')} {barber.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] border border-[#D4AF37]/30 rounded-lg p-8 lg:p-12">
          <h2 className="text-2xl font-bold gold-text mb-6">{t('barbers.approachTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-gray-100 mb-2">{t('barbers.learning')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('barbers.learningDesc')}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-100 mb-2">{t('barbers.clientFocus')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('barbers.clientFocusDesc')}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-100 mb-2">{t('barbers.masters')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('barbers.mastersDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

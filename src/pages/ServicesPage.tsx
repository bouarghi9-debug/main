import { Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';

export default function ServicesPage() {
  const { t } = useLanguage();

  const experienceImages = [
    '/gallery/8dbfbdfc-3ccf-43a5-befb-1b2cbe57a698_(1).png',
    '/gallery/793394d2-fd80-48af-9d39-a9d9884ca63b_(1).png',
    '/gallery/6019f4fb-397f-4ba8-a777-509046e2377f_(1).png',
    '/gallery/files_6492453-1767348440330-files_6492453-1767347967843-chatgpt_image_jan_2,_2026,_04_55_55_am.png',
    '/gallery/files_6492453-1767348775845-files_6492453-1767348594443-files_6492453-1767348224204-image.png',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % experienceImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [experienceImages.length]);

  const services = [
    {
      id: 1,
      nameKey: 'services.haircut',
      price: '$30',
      duration: '30',
      descKey: 'services.haircutDesc',
      bookingUrl: 'https://prime-cutz.setmore.com/book?step=staff&products=85318225-4862-4bd0-a4f6-9c39fa6e4014&type=service',
    },
    {
      id: 2,
      nameKey: 'services.haircutBeard',
      price: '$35',
      duration: '40',
      descKey: 'services.haircutBeardDesc',
      bookingUrl: 'https://prime-cutz.setmore.com/book?step=staff&products=9e59f970-f11e-4732-9f99-a96e143023af&type=service',
    },
    {
      id: 3,
      nameKey: 'services.kidsCut',
      price: '$25',
      duration: '30',
      descKey: 'services.kidsCutDesc',
      bookingUrl: 'https://prime-cutz.setmore.com/book?step=staff&products=6f58cdbc-ed0a-4108-9828-17b31a5ad8cf&type=service',
    },
    {
      id: 4,
      nameKey: 'services.beardLineup',
      price: '$15',
      duration: '15',
      descKey: 'services.beardLineupDesc',
      bookingUrl: 'https://prime-cutz.setmore.com/book?step=staff&products=6584a851-9299-46f2-8c3e-935c03507070&type=service',
    },
  ];

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold gold-text mb-4">{t('services.title')}</h1>
          <p className="text-gray-400 text-lg">{t('services.subtitle')}</p>
        </div>

        {/* Experience Section */}
        <div className="mb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative overflow-hidden rounded-2xl aspect-[4/3] lg:aspect-auto lg:h-[500px]">
              {experienceImages.map((img, idx) => (
                <img
                  key={img}
                  src={img}
                  alt="Prime Cutz Barbershop Experience"
                  className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-1000 ${
                    idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-4">
                {t('services.expectTitle')}
              </h2>
              <ul className="space-y-4 text-gray-300">
                <li className="flex gap-3">
                  <span className="gold-text font-bold">•</span>
                  <span>{t('services.expect1')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="gold-text font-bold">•</span>
                  <span>{t('services.expect2')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="gold-text font-bold">•</span>
                  <span>{t('services.expect3')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="gold-text font-bold">•</span>
                  <span>{t('services.expect4')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-lg p-6 hover:border-[#D4AF37]/60 transition-all duration-300 group hover:shadow-lg hover:shadow-[#D4AF37]/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-100 group-hover:gold-text transition">
                    {t(service.nameKey)}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                    <Clock className="w-4 h-4 gold-text" />
                    {service.duration} {t('common.mins')}
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {t(service.descKey)}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold gold-text">
                  {service.price}
                </div>
                <a
                  href={service.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-all duration-300"
                >
                  {t('services.bookService')}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-400">{t('services.payment')}</p>
        </div>
      </div>
    </div>
  );
}

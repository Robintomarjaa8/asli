import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const slides = [
  {
    id: 1,
    title: 'Discover the Latest Tech',
    subtitle: 'Up to 40% off on electronics',
    description: 'From smartphones to smartwatches, find everything you need.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200',
    cta: 'Shop Electronics',
    link: '/category/electronics',
  },
  {
    id: 2,
    title: 'Fashion Forward',
    subtitle: 'New season styles',
    description: 'Trendy clothing and accessories for every occasion.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
    cta: 'Shop Fashion',
    link: '/category/fashion',
  },
  {
    id: 3,
    title: 'Home Essentials',
    subtitle: 'Transform your space',
    description: 'Beautiful home decor and kitchen essentials at great prices.',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200',
    cta: 'Shop Home',
    link: '/category/home-kitchen',
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[420px] md:h-[500px] overflow-hidden">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container-custom">
              <div className="max-w-xl text-white">
                <p className="text-accent-400 font-semibold mb-2 uppercase tracking-wider text-sm">
                  {slide.subtitle}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                  {slide.title}
                </h1>
                <p className="text-white/80 mb-6 text-lg">{slide.description}</p>
                <Link
                  to={slide.link}
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:gap-3"
                >
                  {slide.cta} <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === current ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
import React, { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Switch } from '@/components/ui/switch';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import { useIsMobile } from '@/hooks/use-mobile';

interface SessionTimeoutCarouselProps {
  onClose: () => void;
}

const SessionTimeoutCarousel: React.FC<SessionTimeoutCarouselProps> = ({ onClose }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const isMobile = useIsMobile();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time and date
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Finance-related images from Unsplash and Freepik
  const images = [
    { src: 'https://source.unsplash.com/featured/?finance,money,800x600', alt: 'Finance and Money' },
    { src: 'https://source.unsplash.com/featured/?banking,800x600', alt: 'Banking Services' },
    { src: 'https://source.unsplash.com/featured/?investment,800x600', alt: 'Investment Planning' },
    { src: 'https://source.unsplash.com/featured/?currency,exchange,800x600', alt: 'Currency Exchange' },
    { src: 'https://source.unsplash.com/featured/?remittance,transfer,800x600', alt: 'Money Transfer' },
    { src: 'https://source.unsplash.com/featured/?financial,planning,800x600', alt: 'Financial Planning' },
    { src: 'https://source.unsplash.com/featured/?business,finance,800x600', alt: 'Business Finance' },
    { src: 'https://source.unsplash.com/featured/?wealth,management,800x600', alt: 'Wealth Management' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        {/* Header with logo/branding and time/date - Responsive layout */}
        <div className={`absolute top-4 left-4 right-4 z-20 flex items-center ${
          isMobile ? 'flex-row justify-between gap-2' : 'justify-between'
        }`}>
          {/* Logo and branding section */}
          <div className="flex items-center gap-2">
            <img 
              src="https://i.ibb.co/6LY7bxR/rjb-logo.jpg" 
              alt="RJB TRANZ Logo" 
              className={`rounded-full ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}
            />
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
              <div 
                className={`text-white font-bold font-montserrat ${isMobile ? 'text-xs' : 'text-sm'}`}
                style={{ fontSize: isMobile ? '60%' : '80%' }}
              >
                RJB TRANZ
              </div>
              <div 
                className={`text-white/80 ${isMobile ? 'text-xs' : 'text-xs'}`}
                style={{ fontSize: isMobile ? '60%' : '80%' }}
              >
                Money Transfer
              </div>
            </div>
          </div>

          {/* Time and date section */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 text-right">
            <div 
              className={`text-white font-mono ${isMobile ? 'text-xs' : 'text-sm'}`}
              style={{ fontSize: isMobile ? '60%' : '80%' }}
            >
              {formatTime(currentTime)}
            </div>
            <div 
              className={`text-white/80 ${isMobile ? 'text-xs' : 'text-xs'}`}
              style={{ fontSize: isMobile ? '60%' : '80%' }}
            >
              {formatDate(currentTime)}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-30 bg-red-500/20 hover:bg-red-500/30 text-white rounded-full p-1 transition-colors text-sm"
        >
          ✕
        </button>

        <Carousel
          plugins={[
            Autoplay({
              delay: 5000,
            }),
            Fade()
          ]}
          className="w-full"
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-opacity duration-1000"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
                    {index + 1} / {images.length}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>

        <div className="mt-4 text-center text-white">
          <p className="text-lg font-semibold mb-2">Session Timeout</p>
          <p className="text-sm opacity-80">Your session will expire soon. Please interact with the app to continue.</p>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutCarousel;
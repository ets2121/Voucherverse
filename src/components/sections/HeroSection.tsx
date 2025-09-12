'use client';

import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import config from '@/config/heroConfig.json';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const { business } = useAppContext();
  const router = useRouter();

  const handleButtonClick = (action: string, target: string) => {
    if (action === 'scrollTo') {
      const section = document.getElementById(target);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action === 'redirect') {
        router.push(target);
    }
  };
  
  const formatText = (text: string) => {
    return text.replace('{businessName}', business?.name || 'VoucherVerse');
  }

  const sectionStyle = config.backgroundImageUrl 
    ? { backgroundImage: `url(${config.backgroundImageUrl})` }
    : {};

  return (
    <section 
      className="relative pt-32 pb-20 md:pt-48 md:pb-32 text-center bg-cover bg-center bg-no-repeat"
      style={sectionStyle}
      data-ai-hint="background abstract"
    >
        {/* Overlay */}
        <div 
            className="absolute inset-0 bg-background"
            style={{ opacity: config.backgroundImageUrl ? config.backgroundOverlayOpacity : 0 }}
        ></div>

        <div 
          className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.h1 
            className="font-headline text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: config.animation.duration }}
          >
            {formatText(config.title)}
          </motion.h1>
          
          <motion.p 
            className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: config.animation.duration, delay: config.animation.delayIncrement * 1 }}
          >
            {formatText(config.subtitle)}
          </motion.p>

          {config.additionalText && config.additionalText.length > 0 && (
             <div className="mt-4 max-w-2xl mx-auto space-y-2">
                {config.additionalText.map((text, index) => (
                    <motion.p
                        key={index}
                        className="text-md text-muted-foreground"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: config.animation.duration, delay: config.animation.delayIncrement * (2 + index) }}
                    >
                        {formatText(text)}
                    </motion.p>
                ))}
            </div>
          )}
          
          <div className="mt-8 flex justify-center items-center gap-4">
            {config.buttons.map((button, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: config.animation.duration, delay: config.animation.delayIncrement * (2 + (config.additionalText?.length || 0) + index) }}
              >
                 <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {button.action === 'redirect' ? (
                    <Link href={button.target}>
                      {button.text}
                    </Link>
                  ) : (
                    <button onClick={() => handleButtonClick(button.action, button.target)}>
                      {button.text}
                    </button>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

        </div>
    </section>
  );
}

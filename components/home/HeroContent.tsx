'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Globe2, Users, BarChart3, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface HeroContentProps {
  children?: React.ReactNode;
}

export function HeroContent({ children }: HeroContentProps) {
  const t = useTranslations('home');

  const features = [
    { text: t('features.standardized'), icon: CheckCircle2 },
    { text: t('features.departmental'), icon: BarChart3 },
    { text: t('features.detailed'), icon: Users },
    { text: t('features.datadriven'), icon: Zap }
  ];

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs sm:text-sm font-medium"
              >
                <Globe2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Open Source Hiring Platform</span>
              </motion.div>

              {/* Title */}
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
                  {t('title')}
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-1 sm:mt-2">
                    {t('subtitle')}
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl">
                  {t('description')}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all">
                    {t('register')}
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 border-2">
                    {t('login')}
                  </Button>
                </Link>
              </div>

              {/* Feature Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-3"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow"
                  >
                    <feature.icon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Jobs Section */}
              {children && (
                <div className="pt-8">
                  {children}
                </div>
              )}
            </motion.div>

            {/* Right Content - Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex items-center justify-center lg:min-h-[500px]"
            >
              {/* Abstract illustration */}
              <div className="relative w-full max-w-md">
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full blur-3xl opacity-20"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative aspect-square"
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#6366F1', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <circle cx="100" cy="100" r="80" fill="url(#grad1)" opacity="0.1" />
                    <circle cx="100" cy="100" r="60" fill="url(#grad1)" opacity="0.2" />
                    <circle cx="100" cy="100" r="40" fill="url(#grad1)" opacity="0.3" />
                    <circle cx="100" cy="100" r="20" fill="url(#grad1)" opacity="0.5" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}


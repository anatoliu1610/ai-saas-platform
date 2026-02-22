'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Zap, Shield, Scale, MessageSquare, Workflow } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Chats',
    description: 'Streamlined conversations with GPT-4 and beyond',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'JWT auth, encryption, and SOC2-ready architecture',
  },
  {
    icon: Scale,
    title: 'Production-Grade',
    description: 'Type-safe with tRPC, tested, and deployed-ready',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized with Next.js 15, streaming, and caching',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Streaming',
    description: 'Token-by-token AI responses for instant feedback',
  },
  {
    icon: Workflow,
    title: 'Modern Stack',
    description: 'React, TypeScript, Prisma, PostgreSQL, Docker',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background dark:from-primary/10" />
        
        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              AI Chat Platform{' '}
              <span className="text-primary">Built for Production</span>
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              A production-grade full-stack application demonstrating Staff Engineer-level 
              architecture. Type-safe, secure, and ready to deploy.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built with 2026 Standards
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every decision justified. Every tradeoff documented.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">
              Tech Stack
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                'React 18', 'TypeScript', 'Next.js 15', 'tRPC',
                'Prisma', 'PostgreSQL', 'Redis', 'Tailwind CSS',
                'Framer Motion', 'Docker', 'GitHub Actions',
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground">
            © 2026 AI SaaS Platform. Built with production-grade standards.
          </p>
        </div>
      </footer>
    </div>
  );
}

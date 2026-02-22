'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bot, MessageSquare, Shield, Zap, Code, Database, 
  Lock, Globe, Server, GitBranch, ArrowRight, 
  CheckCircle2, Star, Quote
} from 'lucide-react';

const logos = [
  'Stripe', 'Vercel', 'Linear', 'Raycast', 'Notion', 'Figma'
];

const features = [
  {
    title: 'Real-time AI',
    description: 'Streaming responses with GPT-4, Claude, and local Ollama models.',
    icon: MessageSquare,
    colSpan: 'col-span-2',
  },
  {
    title: 'Type-safe API',
    description: 'tRPC ensures end-to-end type safety across your entire stack.',
    icon: Code,
  },
  {
    title: 'Production Ready',
    description: 'JWT auth, rate limiting, and encryption built-in.',
    icon: Shield,
  },
  {
    title: 'Edge Deploy',
    description: 'Deploy globally with zero configuration.',
    icon: Globe,
  },
  {
    title: 'PostgreSQL + Redis',
    description: 'Battle-tested database layer with caching.',
    icon: Database,
    colSpan: 'col-span-2',
  },
];

const testimonials = [
  {
    quote: "This platform saved us months of development time. The type-safe API is incredible.",
    author: "Sarah Chen",
    role: "CTO at TechCorp",
    avatar: "SC",
  },
  {
    quote: "Best AI chat implementation I've seen. Streaming works perfectly.",
    author: "Marcus Johnson",
    role: "Lead Developer",
    avatar: "MJ",
  },
  {
    quote: "Finally, a production-ready AI platform that actually works out of the box.",
    author: "Elena Rodriguez",
    role: "Founder at AI Labs",
    avatar: "ER",
  },
];

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#' },
  { label: 'Blog', href: '#' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030305] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#030305]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Nexus AI</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-8">
              <Star className="h-3 w-3 text-amber-400" />
              <span>Open Source</span>
              <span className="text-zinc-600">•</span>
              <span>MIT License</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              Build AI apps at{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                lightspeed
              </span>
            </h1>
            
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
              Production-grade AI chat platform with type-safe APIs, 
              real-time streaming, and enterprise security. Deploy in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-zinc-200">
                  Start Building Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Logo Cloud */}
            <div className="mt-16">
              <p className="text-sm text-zinc-500 mb-6">Trusted by teams at</p>
              <div className="flex flex-wrap justify-center gap-8 opacity-50">
                {logos.map((logo) => (
                  <span key={logo} className="text-lg font-medium text-zinc-400">{logo}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Screenshot */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-lg bg-black/30 text-xs text-zinc-500">
                    nexus-ai.app/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard preview mockup */}
              <div className="aspect-[16/9] bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-zinc-500">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-4">
              Everything you need
            </h2>
            <p className="text-zinc-400 text-center mb-12">
              Production-ready components for modern AI applications
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={`${
                    feature.colSpan || ''
                  } rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition-colors group`}
                >
                  <feature.icon className="h-8 w-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-4">
              Loved by developers
            </h2>
            <p className="text-zinc-400 text-center mb-12">
              See what teams are building with Nexus AI
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.author}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <Quote className="h-8 w-8 text-indigo-500/50 mb-4" />
                  <p className="text-zinc-300 mb-6">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-medium">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-zinc-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-12">
              <h2 className="text-3xl font-bold mb-4">
                Ready to build?
              </h2>
              <p className="text-zinc-400 mb-8">
                Start building AI applications in minutes. No credit card required.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-zinc-200">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Nexus AI</span>
            </div>
            <p className="text-sm text-zinc-500">
              © 2026 Nexus AI. Open source under MIT license.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

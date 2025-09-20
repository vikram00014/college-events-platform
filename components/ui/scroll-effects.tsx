'use client'

import React from 'react'
import { useScrollProgress, useScrollDirection, useScrollTrigger } from '@/hooks/useScrollEffects'
import { cn } from '@/lib/utils'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Scroll progress indicator
export function ScrollProgress() {
  const progress = useScrollProgress()

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/50 z-50">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-150 shadow-sm"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Auto-hiding header based on scroll direction
export function AutoHideHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const scrollDirection = useScrollDirection()
  const scrolled = useScrollTrigger(50)

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
      scrollDirection === 'down' && scrolled ? '-translate-y-full' : 'translate-y-0',
      scrolled ? 'backdrop-blur-md bg-white/80 shadow-sm' : 'bg-transparent',
      className
    )}>
      {children}
    </header>
  )
}

// Scroll to top button
export function ScrollToTop() {
  const isVisible = useScrollTrigger(300)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        'fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl',
        'transition-all duration-300 animate-in fade-in slide-in-from-bottom-2',
        'bg-primary hover:bg-primary/90 text-primary-foreground'
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  )
}

// Parallax container
export function ParallaxContainer({ 
  children, 
  speed = 0.5,
  className 
}: { 
  children: React.ReactNode
  speed?: number
  className?: string 
}) {
  const [offsetY, setOffsetY] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.pageYOffset * speed)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div 
      className={cn('parallax', className)}
      style={{ transform: `translateY(${offsetY}px)` }}
    >
      {children}
    </div>
  )
}

// Intersection observer hook for animations
export function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = React.useState(false)
  const [entry, setEntry] = React.useState<IntersectionObserverEntry>()
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        setEntry(entry)
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return { ref: elementRef, inView, entry }
}

// Animate on scroll component
export function AnimateOnScroll({ 
  children, 
  animation = 'fade-up',
  className 
}: { 
  children: React.ReactNode
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right'
  className?: string 
}) {
  const { ref, inView } = useInView()

  const animationClasses = {
    'fade-up': 'translate-y-8 opacity-0',
    'fade-in': 'opacity-0',
    'slide-left': 'translate-x-8 opacity-0',
    'slide-right': '-translate-x-8 opacity-0'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        inView ? 'translate-y-0 translate-x-0 opacity-100' : animationClasses[animation],
        className
      )}
    >
      {children}
    </div>
  )
}

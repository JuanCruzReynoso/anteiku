"use client";

import { motion, useReducedMotion as fmUseReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

// ─── Shared animation variants (used inline by pages) ───
// These are exported as variant objects, not wrapped components.
// Pages import the variants directly and compose with <motion.div>.

/**
 * Re-export of framer-motion's useReducedMotion hook.
 * When the user has `prefers-reduced-motion: reduce`, returns true.
 * Components should use this to conditionally disable animations.
 */
export const useReducedMotion = fmUseReducedMotion;

// ─── No-animation variants (duration: 0) ───
const instantTransition = { duration: 0 };

const fadeInInstant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: instantTransition },
};

const slideUpInstant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: instantTransition },
};

const staggerContainerInstant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0, delayChildren: 0 },
  },
};

const staggerItemInstant: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: instantTransition },
};

// ─── Animated variants (normal motion) ───

const fadeInAnimated: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const slideUpAnimated: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainerAnimated: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItemAnimated: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Hook that returns the right variants based on reduced motion ───

/**
 * Returns the correct variant set depending on the user's motion preference.
 * Usage: const { fadeIn, slideUp, staggerContainer, staggerItem } = useAnimationVariants();
 */
export function useAnimationVariants(): {
  fadeIn: Variants;
  slideUp: Variants;
  staggerContainer: Variants;
  staggerItem: Variants;
} {
  const prefersReduced = fmUseReducedMotion();

  return {
    fadeIn: prefersReduced ? fadeInInstant : fadeInAnimated,
    slideUp: prefersReduced ? slideUpInstant : slideUpAnimated,
    staggerContainer: prefersReduced ? staggerContainerInstant : staggerContainerAnimated,
    staggerItem: prefersReduced ? staggerItemInstant : staggerItemAnimated,
  };
}

// ─── Static exports for components that don't use the hook ───
// Default: animated variants. Use the hook above for reduced-motion support.

export const fadeIn: Variants = fadeInAnimated;
export const slideUp: Variants = slideUpAnimated;
export const staggerContainer: Variants = staggerContainerAnimated;
export const staggerItem: Variants = staggerItemAnimated;

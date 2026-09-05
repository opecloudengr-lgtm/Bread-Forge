"use client";

import { motion } from "framer-motion";
import { LinkButton } from "@/components/site/Button";
import { siteConfig } from "@/lib/site-content";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-parchment">
      <div className="bg-grain absolute inset-0 opacity-40" />
      <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-32 text-center sm:py-40">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-gold"
        >
          {siteConfig.ministry}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 font-display text-4xl font-bold leading-tight sm:text-6xl"
        >
          Welcome to <span className="text-gold-light">{siteConfig.name}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 max-w-xl text-lg italic text-parchment/80"
        >
          {siteConfig.mandateVerse}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-xs uppercase tracking-widest text-parchment/50"
        >
          {siteConfig.mandateReferences}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <LinkButton href="/sermons">Listen to Sermons</LinkButton>
          <LinkButton href="/events" variant="outline">
            See Upcoming Events
          </LinkButton>
          <LinkButton href="/contact" variant="ghost">
            Contact Us →
          </LinkButton>
        </motion.div>
      </div>
    </section>
  );
}

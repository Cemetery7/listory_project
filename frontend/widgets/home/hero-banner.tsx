"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function HeroBanner() {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="relative h-auto min-h-[320px] overflow-hidden rounded-xl border border-white/10 bg-[image:var(--hero-gradient)] p-6 text-white shadow-hero md:h-[350px]"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(255,255,255,.28),transparent_28%),radial-gradient(circle_at_88%_82%,rgba(57,217,138,.24),transparent_24%)]" />
      <div className="relative z-10 grid min-h-[240px] gap-6 md:h-full md:min-h-0 md:items-center 2xl:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-3 inline-flex h-9 items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 text-sm font-semibold backdrop-blur-[16px]">
            <Sparkles size={16} />
            Подборка недели
          </div>
          <h1 className="max-w-[680px] text-4xl font-bold leading-[1.08] md:text-[44px] 2xl:text-[48px]">
            Истории, которые хочется читать.
          </h1>
          <p className="mt-3 max-w-[720px] text-base font-medium leading-7 text-white/86 md:text-[17px]">
            Откройте новые миры, сохраните любимые произведения и начните писать с AI-помощником для тегов и описаний.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-md bg-white px-6 text-base font-medium text-[#171B25] transition duration-200 hover:bg-white/90"
              href={ROUTES.CATALOG}
            >
              Читать подборку
              <ArrowRight size={18} />
            </Link>
            <Link
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-md border border-white/42 bg-white/10 px-6 text-base font-medium text-white transition duration-200 hover:bg-white/16"
              href={ROUTES.CREATE}
            >
              <BookOpen size={18} />
              Начать писать
            </Link>
          </div>
        </div>

        <div className="relative hidden h-[220px] 2xl:block">
          <div className="absolute right-6 top-3 h-48 w-32 rotate-6 rounded-lg border border-white/34 bg-white/16 shadow-floating backdrop-blur-[16px] 2xl:w-36" />
          <div className="absolute right-20 top-10 h-44 w-32 -rotate-6 rounded-lg border border-white/34 bg-white/18 shadow-floating backdrop-blur-[16px] 2xl:right-24 2xl:w-36" />
          <div className="absolute right-0 top-20 h-36 w-32 rounded-lg border border-white/34 bg-white/20 p-4 shadow-floating backdrop-blur-[16px]">
            <div className="mb-4 h-3 w-20 rounded-full bg-white/60" />
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-white/34" />
              <div className="h-2 rounded-full bg-white/30" />
              <div className="h-2 w-20 rounded-full bg-white/28" />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

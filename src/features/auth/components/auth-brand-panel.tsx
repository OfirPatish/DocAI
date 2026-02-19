"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { FileText, Shield, Sparkles, MessageSquare, KeyRound, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PANEL_ANIMATION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
} as const;

type PanelConfig = {
  title: string;
  highlights: { icon: LucideIcon; text: string }[];
};

const PAGE_CONFIG: Record<string, PanelConfig> = {
  "/sign-in": {
    title: "Welcome back to your documents.",
    highlights: [
      { icon: Sparkles, text: "Pick up where you left off" },
      { icon: Shield, text: "Secure, private access" },
      { icon: MessageSquare, text: "Resume your AI chats" },
    ],
  },
  "/sign-up": {
    title: "Start analyzing your documents with AI.",
    highlights: [
      { icon: Sparkles, text: "7 summary types at your fingertips" },
      { icon: Shield, text: "Your data never leaves your control" },
      { icon: MessageSquare, text: "Chat with any PDF, get cited answers" },
    ],
  },
  "/forgot-password": {
    title: "We'll help you get back in.",
    highlights: [
      { icon: Mail, text: "Reset link sent to your email" },
      { icon: KeyRound, text: "Create a new password securely" },
      { icon: Shield, text: "Same secure access as before" },
    ],
  },
};

const DEFAULT_CONFIG: PanelConfig = {
  title: "Your documents, your AI assistant.",
  highlights: [
    { icon: Sparkles, text: "Chat with your documents" },
    { icon: Shield, text: "Your data stays private" },
    { icon: MessageSquare, text: "Chat with any PDF" },
  ],
};

export const AuthBrandPanel = () => {
  const pathname = usePathname();
  const config = PAGE_CONFIG[pathname] ?? DEFAULT_CONFIG;

  return (
    <div className="relative hidden min-h-screen shrink-0 flex-col justify-between overflow-hidden bg-primary p-10 lg:flex lg:w-[42%] lg:min-w-[380px] xl:w-[44%] xl:max-w-[520px] xl:p-12">
      <motion.div
        className="relative"
        initial={PANEL_ANIMATION.initial}
        animate={PANEL_ANIMATION.animate}
        transition={PANEL_ANIMATION.transition}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg text-white transition-opacity hover:opacity-80"
          aria-label="DocAI home"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <FileText className="size-5 text-white" aria-hidden />
          </div>
          DocAI
        </Link>
      </motion.div>
      <motion.div
        className="relative space-y-6"
        initial={PANEL_ANIMATION.initial}
        animate={PANEL_ANIMATION.animate}
        transition={{ ...PANEL_ANIMATION.transition, delay: 0.08 }}
      >
        <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">{config.title}</h2>
        <ul className="space-y-3">
          {config.highlights.map((item, index) => (
            <motion.li
              key={item.text}
              className="flex items-center gap-3 text-sm text-white/90"
              initial={PANEL_ANIMATION.initial}
              animate={PANEL_ANIMATION.animate}
              transition={{
                ...PANEL_ANIMATION.transition,
                delay: 0.16 + index * 0.06,
              }}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                <item.icon className="size-4" aria-hidden />
              </div>
              {item.text}
            </motion.li>
          ))}
        </ul>
      </motion.div>
      <motion.p
        className="relative text-xs text-white/50"
        initial={PANEL_ANIMATION.initial}
        animate={PANEL_ANIMATION.animate}
        transition={{ ...PANEL_ANIMATION.transition, delay: 0.35 }}
      >
        &copy; {new Date().getFullYear()} DocAI
      </motion.p>
    </div>
  );
};

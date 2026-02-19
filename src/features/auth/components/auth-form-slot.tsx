"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";

interface AuthFormSlotProps {
  children: ReactNode;
  className?: string;
}

export const AuthFormSlot = ({ children, className }: AuthFormSlotProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.45,
      delay: 0.12,
      ease: [0.22, 1, 0.36, 1],
    }}
    className={className}
  >
    {children}
  </motion.div>
);

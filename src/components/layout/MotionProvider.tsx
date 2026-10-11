"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

// reducedMotion="user": quem pediu menos movimento no sistema não recebe animação de transform.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

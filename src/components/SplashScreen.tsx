import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function SplashScreen({ onDone: _onDone }: { onDone: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void bg-grid overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => {
          // handled by timer in parent; this component just renders
        }}
      >
        <motion.div
          className="absolute h-64 w-64 rounded-full bg-lime/20 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14 }}
          className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-lime text-void glow-lime"
        >
          <Zap size={36} strokeWidth={2.5} fill="currentColor" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="font-display mt-6 text-2xl font-black tracking-wide text-ink"
        >
          LINKUP <span className="text-lime">SPORTS</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-2 flex items-center gap-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
          <p className="font-display text-xs font-bold tracking-[0.3em] text-lime">
            GAME MODE ACTIVATED
          </p>
          <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="mt-1 text-xs text-ink-faint"
        >
          Every court. Every pitch. One feed.
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

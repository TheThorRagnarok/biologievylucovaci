import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Toaster } from 'sonner'
import { useGame } from './game/store'
import { EndScreen } from './screens/EndScreen'
import { GameScreen } from './screens/GameScreen'
import { StartScreen } from './screens/StartScreen'

export default function App() {
  const screen = useGame((s) => s.screen)
  const seed = useGame((s) => s.maze?.seed ?? 0)
  const key = screen === 'game' ? `game-${seed}` : screen

  return (
    // reducedMotion="user": při "Omezit pohyb" zůstanou jen průhlednosti, bez posunů a pružin
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={key}
          className="h-full"
          initial={{ opacity: 0, scale: 0.985, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.99, y: -6 }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
        >
          {screen === 'menu' && <StartScreen />}
          {screen === 'game' && <GameScreen />}
          {screen === 'end' && <EndScreen />}
        </motion.main>
      </AnimatePresence>
      <Toaster
        position="top-center"
        visibleToasts={2}
        gap={8}
        offset={{ top: 'calc(env(safe-area-inset-top, 0px) + 112px)' }}
        mobileOffset={{ top: 'calc(env(safe-area-inset-top, 0px) + 112px)' }}
        toastOptions={{ unstyled: true }}
      />
    </MotionConfig>
  )
}

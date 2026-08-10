import { motion } from 'framer-motion';

interface Props {
  name: string;
  size?: number;
  glow?: boolean;
}

// Avatar circular con inicial y gradiente + jelly idle animation.
export function Avatar({ name, size = 44, glow = false }: Props) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <motion.div
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #9B5CFF, #FF3D8D)',
        border: '2px solid rgba(255,255,255,0.25)',
        boxShadow: glow
          ? '0 0 20px rgba(155,92,255,0.5), inset 0 1px 1px rgba(255,255,255,0.3)'
          : 'inset 0 1px 1px rgba(255,255,255,0.25)',
        fontSize: size * 0.42,
      }}
      animate={{
        scale: [1, 1.04, 0.97, 1.02, 1],
        rotate: [0, 1.5, -1.5, 0.8, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        repeatDelay: 2,
      }}
    >
      {initial}
    </motion.div>
  );
}

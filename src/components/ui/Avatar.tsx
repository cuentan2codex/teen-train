interface Props {
  name: string;
  size?: number;
  glow?: boolean;
}

// Avatar circular con inicial y gradiente.
export function Avatar({ name, size = 44, glow = false }: Props) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
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
    >
      {initial}
    </div>
  );
}

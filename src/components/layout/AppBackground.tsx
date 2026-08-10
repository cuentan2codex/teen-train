// Fondo dinámico con blobs de luz que se mueven lentamente.
// Se renderiza una sola vez al nivel raíz.
export function AppBackground() {
  return (
    <>
      <div className="app-background" aria-hidden>
        <div className="app-blob blob-1" />
        <div className="app-blob blob-2" />
        <div className="app-blob blob-3" />
        <div className="app-blob blob-4" />
      </div>
      <div className="app-noise" aria-hidden />
    </>
  );
}

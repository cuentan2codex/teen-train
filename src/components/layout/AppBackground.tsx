// Fondo dinámico con blobs de luz que se mueven muy lentamente.
// Sin capa de ruido — el acabado es liso y cristalino.
export function AppBackground() {
  return (
    <div className="app-background" aria-hidden>
      <div className="app-blob blob-1" />
      <div className="app-blob blob-2" />
      <div className="app-blob blob-3" />
      <div className="app-blob blob-4" />
    </div>
  );
}

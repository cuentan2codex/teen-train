import { useEffect, useRef, useState, useCallback } from 'react';

// Cronómetro ascendente: cuenta segundos desde 0.
// Sigue corriendo aunque el usuario cambie de pantalla (mientras la app esté abierta).
export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const startRef = useRef<number>(Date.now());
  const baseRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();
    const base = baseRef.current;
    const tick = () => {
      const now = Date.now();
      setElapsed(base + Math.floor((now - startRef.current) / 1000));
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [running]);

  const pause = useCallback(() => {
    baseRef.current = elapsed;
    setRunning(false);
  }, [elapsed]);

  const resume = useCallback(() => {
    if (!running) setRunning(true);
  }, [running]);

  const reset = useCallback(() => {
    baseRef.current = 0;
    setElapsed(0);
  }, []);

  return { elapsed, running, pause, resume, reset };
}

// Temporizador regresivo (descanso). Llama a onComplete al llegar a 0.
export function useCountdown(seconds: number, onComplete?: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback((s?: number) => {
    setRemaining(s ?? seconds);
    setRunning(true);
  }, [seconds]);

  const pause = useCallback(() => setRunning(false), []);
  const resume = useCallback(() => setRunning(true), []);
  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(seconds);
  }, [seconds]);

  return { remaining, running, start, pause, resume, reset };
}

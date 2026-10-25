import { Accelerometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AccelSample } from "@/lib/slope";

const INTERVAL_MS = 20; // 50 Hz
const LIVE_WINDOW = 25; // 0.5 sn
const UI_REFRESH_MS = 100;

// Ekran açıkken ivmeölçeri dinler, çıkınca bırakır (açık kalırsa pil tüketir)
export function useAccelerometer() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [live, setLive] = useState<AccelSample[]>([]);
  const buffer = useRef<AccelSample[]>([]);
  const recorder = useRef<{ samples: AccelSample[]; until: number; done: (s: AccelSample[]) => void } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Accelerometer.isAvailableAsync().then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    Accelerometer.setUpdateInterval(INTERVAL_MS);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const sample = { x, y, z };
      buffer.current.push(sample);
      if (buffer.current.length > LIVE_WINDOW) buffer.current.shift();
      const rec = recorder.current;
      if (rec) {
        rec.samples.push(sample);
        if (Date.now() >= rec.until) {
          recorder.current = null;
          rec.done(rec.samples);
        }
      }
    });
    const timer = setInterval(() => setLive([...buffer.current]), UI_REFRESH_MS);
    return () => {
      cancelled = true;
      subscription.remove();
      clearInterval(timer);
      recorder.current = null;
    };
  }, []);

  // durationMs boyunca örnek toplar
  const record = useCallback(
    (durationMs: number) =>
      new Promise<AccelSample[]>((resolve) => {
        recorder.current = { samples: [], until: Date.now() + durationMs, done: resolve };
      }),
    [],
  );

  return { available, live, record };
}

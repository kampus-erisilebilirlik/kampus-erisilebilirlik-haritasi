import { Accelerometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AccelSample } from "@/lib/slope";

const INTERVAL_MS = 20; // 50 Hz
const LIVE_WINDOW = 25; // 0.5 sn
const UI_REFRESH_MS = 100;
// Sensör olay göndermeyi keserse (ör. uygulama arka planda) kayıt bu kadar ek süre sonra eldekiyle biter
const RECORD_GRACE_MS = 1000;

type Recorder = { samples: AccelSample[]; until: number; finish: () => void };

// Ekran açıkken ivmeölçeri dinler, çıkınca bırakır (açık kalırsa pil tüketir)
export function useAccelerometer() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [live, setLive] = useState<AccelSample[]>([]);
  const buffer = useRef<AccelSample[]>([]);
  const recorder = useRef<Recorder | null>(null);

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
        if (Date.now() >= rec.until) rec.finish();
      }
    });
    const timer = setInterval(() => setLive([...buffer.current]), UI_REFRESH_MS);
    return () => {
      cancelled = true;
      subscription.remove();
      clearInterval(timer);
      recorder.current?.finish();
    };
  }, []);

  // durationMs boyunca örnek toplar; sensör susarsa süre + RECORD_GRACE_MS sonunda eldekini döner
  const record = useCallback(
    (durationMs: number) =>
      new Promise<AccelSample[]>((resolve) => {
        const rec: Recorder = {
          samples: [],
          until: Date.now() + durationMs,
          finish: () => {
            clearTimeout(timeout);
            if (recorder.current === rec) recorder.current = null;
            resolve(rec.samples);
          },
        };
        const timeout = setTimeout(rec.finish, durationMs + RECORD_GRACE_MS);
        recorder.current = rec;
      }),
    [],
  );

  return { available, live, record };
}

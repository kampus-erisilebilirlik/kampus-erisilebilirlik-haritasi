// Gizli yönetici girişi (#5, #19): count dokunuş windowMs içinde tamamlanınca true döner ve sayaç sıfırlanır
export function createTapCounter(count = 5, windowMs = 3000, now: () => number = Date.now): () => boolean {
  let taps: number[] = [];
  return () => {
    const t = now();
    taps = [...taps.filter((x) => t - x < windowMs), t];
    if (taps.length < count) return false;
    taps = [];
    return true;
  };
}

import type { Point } from "./schemas";
import { checkRamp, TS9111, type Handrail, type Ts9111Thresholds } from "./ts9111";

const handrailBySides: Record<number, Handrail> = { 0: "none", 1: "one", 2: "both" };

function handrailOf(point: Point): Handrail | null {
  if (point.ramp_handrail_sides != null) return handrailBySides[point.ramp_handrail_sides] ?? null;
  // Yalnızca "var" bilgisi tek mi çift mi olduğunu söylemez
  return point.ramp_has_handrail === false ? "none" : null;
}

// Rampanın hangi TS 9111 kuralını aştığı (#15). Eşikler (#21) veya ölçümler eksikse boş liste döner;
// uygunluk kararı yine veri girişinden gelen ts9111_compliant'tır
export function rampViolations(point: Point, thresholds: Ts9111Thresholds | null = TS9111): string[] {
  const handrail = handrailOf(point);
  if (
    !thresholds ||
    handrail === null ||
    point.ramp_slope_pct === null ||
    point.ramp_width_cm === null ||
    point.ramp_length_cm == null
  ) {
    return [];
  }
  return checkRamp(
    {
      slopePct: point.ramp_slope_pct,
      lengthCm: point.ramp_length_cm,
      widthCm: point.ramp_width_cm,
      handrail,
      riseCm: point.ramp_rise_cm ?? undefined,
    },
    thresholds,
  ).violations;
}

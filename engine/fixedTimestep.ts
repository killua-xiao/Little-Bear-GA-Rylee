/** Fixed timestep accumulator — keeps physics/input stable across refresh rates. */

export const FIXED_DT_MS = 1000 / 60;
export const MAX_FRAME_DT_MS = 100; // clamp spiral-of-death on tab resume
export const MAX_STEPS_PER_FRAME = 5;

export class FixedTimestep {
  private accumulator = 0;
  private lastTime: number | null = null;

  /** Advance clock; returns how many fixed steps to run this display frame. */
  tick(nowMs: number): number {
    if (this.lastTime === null) {
      this.lastTime = nowMs;
      return 1;
    }

    let dt = nowMs - this.lastTime;
    this.lastTime = nowMs;
    if (dt > MAX_FRAME_DT_MS) dt = MAX_FRAME_DT_MS;

    this.accumulator += dt;
    let steps = 0;
    while (this.accumulator >= FIXED_DT_MS && steps < MAX_STEPS_PER_FRAME) {
      this.accumulator -= FIXED_DT_MS;
      steps++;
    }

    // If we fell behind hard, drop residual to avoid cascading catch-up
    if (steps === MAX_STEPS_PER_FRAME) {
      this.accumulator = 0;
    }

    return steps;
  }

  /** 0..1 blend factor for optional render interpolation. */
  get alpha(): number {
    return this.accumulator / FIXED_DT_MS;
  }

  reset(): void {
    this.accumulator = 0;
    this.lastTime = null;
  }
}

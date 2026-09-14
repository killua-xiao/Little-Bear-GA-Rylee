import { describe, expect, it } from 'vitest';
import { FixedTimestep, FIXED_DT_MS } from './fixedTimestep';

describe('FixedTimestep', () => {
  it('runs one step near 60Hz', () => {
    const clock = new FixedTimestep();
    expect(clock.tick(0)).toBe(1);
    expect(clock.tick(FIXED_DT_MS)).toBe(1);
  });

  it('catches up with multiple steps after a hitch', () => {
    const clock = new FixedTimestep();
    clock.tick(0);
    expect(clock.tick(FIXED_DT_MS * 3.2)).toBe(3);
  });

  it('clamps spiral-of-death after long pause', () => {
    const clock = new FixedTimestep();
    clock.tick(0);
    const steps = clock.tick(5000);
    expect(steps).toBeLessThanOrEqual(5);
  });
});

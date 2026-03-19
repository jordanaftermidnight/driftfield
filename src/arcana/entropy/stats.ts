// ============================================================================
// DRIFTFIELD — STATISTICAL ANALYSIS SUITE
// Analyzes raw entropy bytes to produce field metadata
// ============================================================================

import type { EntropyMetadata } from '../types';

/**
 * Shannon entropy of a byte stream, normalized to [0, 1].
 * H = -Σ p(x) log2(p(x)) / 8
 * Perfect randomness → 1.0. All identical bytes → 0.0.
 */
function shannonEntropy(bytes: Uint8Array): number {
  if (bytes.length === 0) return 0;

  const freq = new Uint32Array(256);
  for (let i = 0; i < bytes.length; i++) {
    freq[bytes[i]]++;
  }

  let entropy = 0;
  const len = bytes.length;
  for (let i = 0; i < 256; i++) {
    if (freq[i] === 0) continue;
    const p = freq[i] / len;
    entropy -= p * Math.log2(p);
  }

  // Normalize: max Shannon entropy for bytes is 8 bits
  return entropy / 8;
}

/**
 * Chi-squared test for uniform distribution of byte values.
 * Tests whether observed byte frequencies deviate from expected uniform distribution.
 * Returns statistic, p-value, and degrees of freedom.
 */
function chiSquaredTest(bytes: Uint8Array): { statistic: number; pValue: number; degreesOfFreedom: number } {
  if (bytes.length === 0) return { statistic: 0, pValue: 1, degreesOfFreedom: 255 };

  const freq = new Uint32Array(256);
  for (let i = 0; i < bytes.length; i++) {
    freq[bytes[i]]++;
  }

  const expected = bytes.length / 256;
  let chiSq = 0;
  for (let i = 0; i < 256; i++) {
    const diff = freq[i] - expected;
    chiSq += (diff * diff) / expected;
  }

  // Approximate p-value using Wilson-Hilferty transformation
  const df = 255;
  const z = Math.pow(chiSq / df, 1 / 3) - (1 - 2 / (9 * df));
  const denom = Math.sqrt(2 / (9 * df));
  const zScore = z / denom;

  // Standard normal CDF approximation (Abramowitz & Stegun)
  const pValue = 1 - normalCDF(zScore);

  return { statistic: chiSq, pValue, degreesOfFreedom: df };
}

/**
 * Serial correlation coefficient.
 * Measures linear correlation between consecutive bytes.
 * Perfect randomness → ~0.0. Strong pattern → ±1.0.
 */
function serialCorrelation(bytes: Uint8Array): number {
  if (bytes.length < 2) return 0;

  const n = bytes.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  for (let i = 0; i < n - 1; i++) {
    const x = bytes[i];
    const y = bytes[i + 1];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const m = n - 1;
  const numerator = m * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (m * sumX2 - sumX * sumX) * (m * sumY2 - sumY * sumY)
  );

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Monte Carlo π estimation.
 * Takes pairs of bytes as (x, y) coordinates in a unit square,
 * counts how many fall inside a quarter circle.
 * π ≈ 4 × (inside / total)
 */
function monteCarloPi(bytes: Uint8Array): { estimate: number; deviation: number } {
  const pairs = Math.floor(bytes.length / 2);
  if (pairs === 0) return { estimate: 0, deviation: Math.PI };

  let inside = 0;
  for (let i = 0; i < pairs; i++) {
    const x = bytes[i * 2] / 255;
    const y = bytes[i * 2 + 1] / 255;
    if (x * x + y * y <= 1) inside++;
  }

  const estimate = 4 * inside / pairs;
  return {
    estimate,
    deviation: Math.abs(estimate - Math.PI)
  };
}

/**
 * Runs test (Wald-Wolfowitz).
 * Tests whether the sequence of above/below-median values is random.
 * Returns z-score and p-value.
 */
function runsTest(bytes: Uint8Array): { zScore: number; pValue: number } {
  if (bytes.length < 2) return { zScore: 0, pValue: 1 };

  // Compute median
  const sorted = Array.from(bytes).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  // Count runs and above/below counts
  let runs = 1;
  let nAbove = 0;
  let nBelow = 0;
  let prevAbove = bytes[0] >= median;
  if (prevAbove) nAbove++; else nBelow++;

  for (let i = 1; i < bytes.length; i++) {
    const isAbove = bytes[i] >= median;
    if (isAbove) nAbove++; else nBelow++;
    if (isAbove !== prevAbove) {
      runs++;
      prevAbove = isAbove;
    }
  }

  if (nAbove === 0 || nBelow === 0) return { zScore: 0, pValue: 1 };

  // Expected runs and standard deviation
  const n = nAbove + nBelow;
  const expectedRuns = (2 * nAbove * nBelow) / n + 1;
  const numerator = 2 * nAbove * nBelow * (2 * nAbove * nBelow - n);
  const denominator = n * n * (n - 1);
  const stdDev = Math.sqrt(numerator / denominator);

  if (stdDev === 0) return { zScore: 0, pValue: 1 };

  const zScore = (runs - expectedRuns) / stdDev;
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));  // two-tailed

  return { zScore, pValue };
}

/**
 * Standard normal CDF approximation.
 * Abramowitz & Stegun formula 26.2.17. Accurate to ~1.5×10⁻⁷.
 */
function normalCDF(x: number): number {
  if (x < -8) return 0;
  if (x > 8) return 1;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;

  const y = 1 - (a1 * t + a2 * t2 + a3 * t3 + a4 * t4 + a5 * t5) * Math.exp(-absX * absX / 2);
  return 0.5 * (1 + sign * y);
}

/**
 * Run the full statistical analysis suite on a byte stream.
 */
export function analyzeEntropy(bytes: Uint8Array): EntropyMetadata {
  return {
    shannon: shannonEntropy(bytes),
    chiSquared: chiSquaredTest(bytes),
    serialCorrelation: serialCorrelation(bytes),
    monteCarloPI: monteCarloPi(bytes),
    runsTest: runsTest(bytes),
    byteCount: bytes.length,
    timestamp: Date.now()
  };
}

/**
 * Derive a polarity value from entropy metadata.
 * Maps the chi-squared z-score to a -1.0 to +1.0 range.
 * Above-expected uniformity → positive polarity.
 * Below-expected uniformity → negative polarity.
 */
export function derivePolarity(metadata: EntropyMetadata): number {
  // Use chi-squared deviation direction
  const expectedChiSq = metadata.chiSquared.degreesOfFreedom; // expected value = df
  const deviation = metadata.chiSquared.statistic - expectedChiSq;
  const normalizedDeviation = deviation / Math.sqrt(2 * expectedChiSq); // standard deviation of chi-sq

  // Clamp to [-1, 1] using tanh
  return Math.tanh(normalizedDeviation * -1); // inverted: lower chi-sq (more uniform) = positive
}

/**
 * Derive anomaly sigma from entropy metadata.
 * Combines all test results into a single anomaly score.
 */
export function deriveAnomalySigma(metadata: EntropyMetadata): number {
  // Collect z-scores from all tests
  const zScores: number[] = [];

  // Shannon: deviation from expected ~1.0
  const shannonExpected = 1.0;
  const shannonDev = Math.abs(metadata.shannon - shannonExpected);
  zScores.push(shannonDev * 20); // scale to roughly match z-score range

  // Chi-squared: use the Wilson-Hilferty z-score
  const df = metadata.chiSquared.degreesOfFreedom;
  const chiZ = Math.pow(metadata.chiSquared.statistic / df, 1 / 3) - (1 - 2 / (9 * df));
  zScores.push(Math.abs(chiZ / Math.sqrt(2 / (9 * df))));

  // Serial correlation: should be ~0
  zScores.push(Math.abs(metadata.serialCorrelation) * Math.sqrt(metadata.byteCount));

  // Monte Carlo π: deviation scaled by expected error
  const expectedPiError = 1.0 / Math.sqrt(metadata.byteCount / 2);
  if (expectedPiError > 0) {
    zScores.push(metadata.monteCarloPI.deviation / expectedPiError);
  }

  // Runs test: z-score directly
  zScores.push(Math.abs(metadata.runsTest.zScore));

  // Combined anomaly: RMS of individual z-scores
  const sumSq = zScores.reduce((acc, z) => acc + z * z, 0);
  return Math.sqrt(sumSq / zScores.length);
}

/**
 * Derive compass bearing from raw bytes.
 * Uses the last 2 bytes to produce a bearing in [0, 360).
 */
export function deriveBearing(bytes: Uint8Array): number {
  if (bytes.length < 2) return 0;
  const val = (bytes[bytes.length - 2] << 8 | bytes[bytes.length - 1]) >>> 0;
  return (val / 65536) * 360;
}

/**
 * Map a compass bearing to an element based on quadrant.
 * N (315–45) = Earth, E (45–135) = Air, S (135–225) = Fire, W (225–315) = Water
 */
export function bearingToElement(bearing: number): 'fire' | 'water' | 'air' | 'earth' {
  const normalized = ((bearing % 360) + 360) % 360;
  if (normalized >= 315 || normalized < 45) return 'earth';
  if (normalized >= 45 && normalized < 135) return 'air';
  if (normalized >= 135 && normalized < 225) return 'fire';
  return 'water';
}

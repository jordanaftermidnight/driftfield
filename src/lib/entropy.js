// Cryptographic entropy sampling + statistical analysis

export function sampleEntropy(bytes = 1024) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return arr;
}

export function shannonEntropy(data) {
  const freq = {};
  for (const b of data) freq[b] = (freq[b] || 0) + 1;
  let H = 0;
  const n = data.length;
  for (const k in freq) {
    const p = freq[k] / n;
    if (p > 0) H -= p * Math.log2(p);
  }
  return H;
}

export function runsTest(data) {
  const median = [...data].sort((a, b) => a - b)[Math.floor(data.length / 2)];
  let runs = 1;
  let maxRun = 1;
  let currentRun = 1;
  for (let i = 1; i < data.length; i++) {
    if ((data[i] >= median) === (data[i - 1] >= median)) {
      currentRun++;
      maxRun = Math.max(maxRun, currentRun);
    } else {
      runs++;
      currentRun = 1;
    }
  }
  const expected = (data.length + 1) / 2;
  const deviation = (runs - expected) / expected;
  return { runs, maxRun, expected, deviation, clusterScore: -deviation };
}

export function chiSquared(data) {
  const expected = data.length / 256;
  const freq = new Array(256).fill(0);
  for (const b of data) freq[b]++;
  let chi2 = 0;
  for (let i = 0; i < 256; i++) {
    chi2 += Math.pow(freq[i] - expected, 2) / expected;
  }
  const normalized = (chi2 - 255) / 255;
  return { chi2, normalized };
}

export function serialCorrelation(data) {
  let sumXY = 0, sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0;
  const n = data.length - 1;
  for (let i = 0; i < n; i++) {
    sumXY += data[i] * data[i + 1];
    sumX += data[i];
    sumY += data[i + 1];
    sumX2 += data[i] ** 2;
    sumY2 += data[i + 1] ** 2;
  }
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));
  return den === 0 ? 0 : num / den;
}

export function monteCarloDeviation(data) {
  let inside = 0;
  const pairs = Math.floor(data.length / 4);
  for (let i = 0; i < pairs; i++) {
    const x = ((data[i * 4] << 8) | data[i * 4 + 1]) / 65536;
    const y = ((data[i * 4 + 2] << 8) | data[i * 4 + 3]) / 65536;
    if (x * x + y * y <= 1) inside++;
  }
  const piEstimate = (4 * inside) / pairs;
  return { piEstimate, deviation: Math.abs(piEstimate - Math.PI) / Math.PI };
}

export function fullEntropyAnalysis(bytes = 2048) {
  const data = sampleEntropy(bytes);
  const shannon = shannonEntropy(data);
  const runs = runsTest(data);
  const chi = chiSquared(data);
  const corr = serialCorrelation(data);
  const mc = monteCarloDeviation(data);

  const entropyDev = Math.abs(8 - shannon) / 8;
  const anomalyScore = (
    entropyDev * 0.2 +
    Math.abs(runs.deviation) * 0.25 +
    Math.abs(chi.normalized) * 0.2 +
    Math.abs(corr) * 0.15 +
    mc.deviation * 0.2
  );

  const angle = ((data[0] << 8) | data[1]) / 65536 * 360;
  const magnitude = ((data[2] << 8) | data[3]) / 65536;
  const actionSeed = data[4] % 8;
  const polaritySeed = data[5];

  const rawPolarity = (polaritySeed / 255) * 2 - 1;
  const polarity = rawPolarity + (anomalyScore > 0.1 ? 0.2 : -0.1);

  return {
    shannon, runs, chi, corr: corr, mc,
    anomalyScore: Math.min(anomalyScore * 3, 1),
    direction: { angle, magnitude, actionSeed },
    polarity: polarity > 0 ? "positive" : "negative",
    polarityRaw: polarity,
    rawData: data.slice(0, 64),
    timestamp: Date.now(),
  };
}

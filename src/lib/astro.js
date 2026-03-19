// Biorhythm, lunar phase, temporal gates, zodiac, field calculation

export function biorhythm(birthDate, targetDate) {
  const diff = Math.floor((targetDate - birthDate) / 86400000);
  return {
    physical: { value: Math.sin((2 * Math.PI * diff) / 23), cycle: 23, label: "Physical" },
    emotional: { value: Math.sin((2 * Math.PI * diff) / 28), cycle: 28, label: "Emotional" },
    intellectual: { value: Math.sin((2 * Math.PI * diff) / 33), cycle: 33, label: "Intellectual" },
    intuitive: { value: Math.sin((2 * Math.PI * diff) / 38), cycle: 38, label: "Intuitive" },
  };
}

export function lunarPhase(date) {
  const knownNew = new Date(2000, 0, 6, 18, 14).getTime();
  const cycle = 29.53058770576;
  const daysSince = (date.getTime() - knownNew) / 86400000;
  const phase = ((daysSince % cycle) + cycle) % cycle;
  const normalized = phase / cycle;
  const names = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  const symbols = ["\u{1F311}", "\u{1F312}", "\u{1F313}", "\u{1F314}", "\u{1F315}", "\u{1F316}", "\u{1F317}", "\u{1F318}"];
  const qualities = [
    "Void potential \u2014 set intentions into the dark",
    "Building momentum \u2014 nurture new beginnings",
    "Tension & decision \u2014 commit or release",
    "Expansion \u2014 amplify what\u2019s working",
    "Peak illumination \u2014 maximum visibility & manifestation",
    "Gratitude & sharing \u2014 distribute gains",
    "Release & let go \u2014 shed what doesn\u2019t serve",
    "Surrender & rest \u2014 prepare for renewal"
  ];
  const idx = Math.floor(normalized * 8) % 8;
  const energy = 0.5 + 0.5 * Math.sin(normalized * Math.PI * 2);
  return { name: names[idx], symbol: symbols[idx], quality: qualities[idx], energy, normalized, daysInCycle: phase.toFixed(1) };
}

export function temporalGate(date) {
  const h = date.getHours() + date.getMinutes() / 60;
  const gates = [
    { name: "Deep Void", range: [0, 3], energy: 0.6, quality: "Subconscious processing. Dreams seed intention. Entropy is high \u2014 random walks in thought may yield breakthroughs." },
    { name: "Pre-Dawn Liminal", range: [3, 5], energy: 0.8, quality: "The veil is thin. Transition zone between unconscious and conscious. High-signal window for intuitive hits." },
    { name: "Dawn Gate", range: [5, 7], energy: 0.9, quality: "Maximum potential energy. Intentions set now carry momentum. The field is most receptive." },
    { name: "Morning Ascent", range: [7, 10], energy: 0.7, quality: "Rising energy. Social encounters gain weight. Good for initiating contact with weak ties." },
    { name: "Solar Apex", range: [10, 13], energy: 0.5, quality: "Peak visibility. Actions taken now have maximum witnesses. Public sharing is amplified." },
    { name: "Afternoon Drift", range: [13, 16], energy: 0.4, quality: "Analytical mind softens. Peripheral attention widens naturally. Aimless exploration yields discoveries." },
    { name: "Twilight Gate", range: [16, 19], energy: 0.85, quality: "Second liminal threshold. Chance encounters peak. Routine deviation is most rewarded." },
    { name: "Evening Integration", range: [19, 22], energy: 0.6, quality: "Pattern recognition strengthens. Review and log events. Connect today\u2019s dots." },
    { name: "Night Descent", range: [22, 24], energy: 0.7, quality: "Defenses lower. Honest reflection. Set tomorrow\u2019s intention before sleep." },
  ];
  const gate = gates.find(g => h >= g.range[0] && h < g.range[1]) || gates[0];
  return { ...gate, hour: h };
}

export function zodiacSign(month, day) {
  const signs = [
    { name: "Capricorn", symbol: "\u2651", start: [1, 1], end: [1, 19], element: "Earth" },
    { name: "Aquarius", symbol: "\u2652", start: [1, 20], end: [2, 18], element: "Air" },
    { name: "Pisces", symbol: "\u2653", start: [2, 19], end: [3, 20], element: "Water" },
    { name: "Aries", symbol: "\u2648", start: [3, 21], end: [4, 19], element: "Fire" },
    { name: "Taurus", symbol: "\u2649", start: [4, 20], end: [5, 20], element: "Earth" },
    { name: "Gemini", symbol: "\u264A", start: [5, 21], end: [6, 20], element: "Air" },
    { name: "Cancer", symbol: "\u264B", start: [6, 21], end: [7, 22], element: "Water" },
    { name: "Leo", symbol: "\u264C", start: [7, 23], end: [8, 22], element: "Fire" },
    { name: "Virgo", symbol: "\u264D", start: [8, 23], end: [9, 22], element: "Earth" },
    { name: "Libra", symbol: "\u264E", start: [9, 23], end: [10, 22], element: "Air" },
    { name: "Scorpio", symbol: "\u264F", start: [10, 23], end: [11, 21], element: "Water" },
    { name: "Sagittarius", symbol: "\u2650", start: [11, 22], end: [12, 21], element: "Fire" },
    { name: "Capricorn", symbol: "\u2651", start: [12, 22], end: [12, 31], element: "Earth" },
  ];
  const d = month * 100 + day;
  return signs.find(s => {
    const start = s.start[0] * 100 + s.start[1];
    const end = s.end[0] * 100 + s.end[1];
    return d >= start && d <= end;
  }) || signs[0];
}

export function calculateField(entropy, birth, now) {
  const bio = birth ? biorhythm(birth, now) : null;
  const lunar = lunarPhase(now);
  const temporal = temporalGate(now);
  const sign = birth ? zodiacSign(birth.getMonth() + 1, birth.getDate()) : null;

  const bioComposite = bio ? (
    bio.physical.value * 0.2 +
    bio.emotional.value * 0.3 +
    bio.intellectual.value * 0.2 +
    bio.intuitive.value * 0.3
  ) : 0;

  const lunarMod = (lunar.energy - 0.5) * 0.4;
  const temporalMod = (temporal.energy - 0.5) * 0.3;
  const entropyMod = entropy.anomalyScore * (entropy.polarity === "positive" ? 1 : -1) * 0.5;

  const composite = bioComposite * 0.3 + lunarMod + temporalMod + entropyMod;
  const polarity = composite >= 0 ? "positive" : "negative";
  const magnitude = Math.min(Math.abs(composite) * 2.5, 1);

  const resonance = (
    (bio ? Math.max(bio.physical.value, bio.emotional.value, bio.intuitive.value) : 0) * 0.3 +
    lunar.energy * 0.35 +
    temporal.energy * 0.35
  );

  return { composite, polarity, magnitude, bio, lunar, temporal, sign, bioComposite, resonance };
}

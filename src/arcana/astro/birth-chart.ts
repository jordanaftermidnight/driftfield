// Birth chart calculation wrapper for circular-natal-horoscope-js
// Free tier: sun sign only
// Premium: full chart (sun, moon, rising, planets)

// @ts-ignore — no types for this package
import { Horoscope } from 'circular-natal-horoscope-js';

export interface BirthChartInput {
  date: Date;          // birth date
  time?: string;       // "HH:MM" or undefined
  latitude: number;
  longitude: number;
  timezone?: string;   // IANA timezone string
}

export interface BirthChartResult {
  sunSign: string;
  moonSign?: string;
  risingSign?: string;
  chartData?: Record<string, unknown>;  // full chart for premium display
}

export function calculateBirthChart(input: BirthChartInput, isPremium: boolean): BirthChartResult {
  const { date, time, latitude, longitude } = input;

  const [hours, minutes] = time ? time.split(':').map(Number) : [12, 0];

  const origin = {
    year: date.getFullYear(),
    month: date.getMonth(),  // 0-indexed
    date: date.getDate(),
    hour: hours,
    minute: minutes,
    latitude,
    longitude,
  };

  const horoscope = new Horoscope({
    origin,
    hpiFormat: 'Sidereal',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points', 'angles'],
    aspectWithPoints: ['bodies', 'points', 'angles'],
    aspectTypes: ['major'],
    customOrbs: {},
    language: 'en',
  });

  const sunSign = horoscope?.CelestialBodies?.sun?.Sign?.label || 'Unknown';

  if (!isPremium) {
    return { sunSign };
  }

  const moonSign = horoscope?.CelestialBodies?.moon?.Sign?.label;
  const risingSign = horoscope?.Ascendant?.Sign?.label;

  return {
    sunSign,
    moonSign,
    risingSign,
    chartData: {
      planets: horoscope?.CelestialBodies,
      houses: horoscope?.Houses,
      ascendant: horoscope?.Ascendant,
      midheaven: horoscope?.Midheaven,
    },
  };
}

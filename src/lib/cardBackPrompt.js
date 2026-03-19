// ============================================================
// DRIFTFIELD: Card Back Prompt Engine
// ============================================================
// Builds rich image-generation prompts for personalized tarot
// card backs based on the user's birth chart, reading context,
// and field entropy state.
// ============================================================

// Zodiac sign → visual motifs
const ZODIAC_MOTIFS = {
  aries:       'ram horns, fire sparks, bold angular geometry',
  taurus:      'bull silhouette, flowering vines, earthy textures',
  gemini:      'twin figures, mirrored symmetry, air currents',
  cancer:      'crescent moon, ocean waves, shell spirals',
  leo:         'solar rays, lion mane, radiant gold geometry',
  virgo:       'wheat sheaves, intricate linework, hexagonal lattice',
  libra:       'balanced scales, harmonious curves, pastel gradients',
  scorpio:     'scorpion tail, deep water, transformation symbols',
  sagittarius: 'arrow and bow, starfields, expansive horizon',
  capricorn:   'mountain peaks, crystalline structures, ancient stone',
  aquarius:    'lightning bolts, wave patterns, futuristic geometry',
  pisces:      'two fish, flowing water, dreamlike nebula',
};

// Element → color palette
const ELEMENT_PALETTES = {
  fire:  'deep crimson, amber gold, burnt orange on dark background',
  water: 'midnight blue, teal, silver-white on deep navy background',
  earth: 'forest green, bronze, warm brown on dark umber background',
  air:   'lavender, pale gold, silver on deep indigo background',
};

// Domain tags → thematic overlay
const DOMAIN_THEMES = {
  love:       'intertwined ribbons, heart geometry, rose motifs',
  career:     'ascending stairs, compass rose, key symbols',
  spiritual:  'third eye, lotus bloom, sacred geometry mandala',
  health:     'caduceus elements, flowing energy lines, vitality spirals',
  creative:   'paint splashes, musical notes, swirling inspiration',
  financial:  'coin stacks, growth charts as abstract art, abundance symbols',
  family:     'tree of life, nesting circles, protective arch',
  travel:     'compass, map lines, horizon and path symbols',
};

// Tone → artistic style
const TONE_STYLES = {
  practical:   'clean Art Deco linework, structured geometric patterns',
  poetic:      'flowing Art Nouveau curves, organic dreamlike forms',
  direct:      'bold minimalist design, strong contrast, simple shapes',
  mystical:    'dense sacred geometry, esoteric symbols, layered mandalas',
  nurturing:   'soft watercolor washes, gentle curves, warm glow',
  challenging: 'sharp angular forms, stark contrasts, dramatic shadows',
};

/**
 * Build an image generation prompt for a personalized tarot card back.
 *
 * @param {Object} opts
 * @param {string} [opts.sunSign]     - User's sun sign (lowercase)
 * @param {string} [opts.moonSign]    - User's moon sign (lowercase)
 * @param {string} [opts.risingSign]  - User's rising sign (lowercase)
 * @param {string[]} [opts.domainTags] - Active domain tags for the reading
 * @param {string} [opts.tone]        - Reading tone setting
 * @param {Object} [opts.field]       - Field entropy snapshot
 * @param {number} [opts.field.polarity]
 * @param {number} [opts.field.bearing]
 * @param {number} [opts.field.anomalySigma]
 * @returns {string} The complete image generation prompt
 */
export function buildCardBackPrompt(opts = {}) {
  const parts = [];

  // Base
  parts.push(
    'A vertical tarot card back design, symmetrical, ornate border,',
    'dark background, no text, no numbers, no letters, no words,',
    'high detail, centered composition, 2:3 aspect ratio.'
  );

  // Sun sign motifs (primary influence)
  const sunMotifs = ZODIAC_MOTIFS[opts.sunSign];
  if (sunMotifs) {
    parts.push(`Primary visual motifs: ${sunMotifs}.`);
  }

  // Element palette from sun sign
  const element = getElement(opts.sunSign);
  const palette = ELEMENT_PALETTES[element];
  if (palette) {
    parts.push(`Color palette: ${palette}.`);
  }

  // Moon sign adds subtlety
  const moonMotifs = ZODIAC_MOTIFS[opts.moonSign];
  if (moonMotifs && opts.moonSign !== opts.sunSign) {
    parts.push(`Subtle background elements: ${moonMotifs}.`);
  }

  // Rising sign adds border style
  const risingMotifs = ZODIAC_MOTIFS[opts.risingSign];
  if (risingMotifs && opts.risingSign !== opts.sunSign) {
    parts.push(`Border decoration inspired by: ${risingMotifs}.`);
  }

  // Domain theme
  if (opts.domainTags?.length > 0) {
    const themes = opts.domainTags
      .map(tag => DOMAIN_THEMES[tag])
      .filter(Boolean)
      .join(', ');
    if (themes) {
      parts.push(`Incorporating symbolic elements: ${themes}.`);
    }
  }

  // Tone → artistic style
  const style = TONE_STYLES[opts.tone];
  if (style) {
    parts.push(`Artistic style: ${style}.`);
  }

  // Field entropy influence
  if (opts.field) {
    if (opts.field.anomalySigma > 2) {
      parts.push('Heightened energy: glowing edges, luminous highlights, charged atmosphere.');
    }
    if (opts.field.polarity < -0.3) {
      parts.push('Cool undertones, introspective mood, deep shadows.');
    } else if (opts.field.polarity > 0.3) {
      parts.push('Warm undertones, expansive mood, radiant highlights.');
    }
  }

  // Quality suffix
  parts.push(
    'Professional quality, suitable for print,',
    'inspired by vintage occult illustration and sacred geometry.'
  );

  return parts.join(' ');
}

function getElement(sign) {
  const elements = {
    aries: 'fire', leo: 'fire', sagittarius: 'fire',
    taurus: 'earth', virgo: 'earth', capricorn: 'earth',
    gemini: 'air', libra: 'air', aquarius: 'air',
    cancer: 'water', scorpio: 'water', pisces: 'water',
  };
  return elements[sign] || 'fire';
}

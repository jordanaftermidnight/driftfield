// ============================================================================
// DRIFTFIELD — ML VISION TRAINING DATA SPECIFICATION
// Card scan sources, dataset structure, and training pipeline for Stage 2
// camera mode (physical card recognition)
// ============================================================================

/**
 * TRAINING DATA SOURCES — Assessed and prioritized
 *
 * PRIMARY (RWS, Phase 1):
 *
 * 1. Internet Archive rider-waite-tarot
 *    - 78 cards, 400+ dpi PNG, explicit Public Domain Mark 1.0
 *    - Best provenance and clearest licensing
 *    - URL: archive.org/details/rider-waite-tarot
 *
 * 2. MediaFire WS_Tarot_scans.rar (~396MB)
 *    - 78 cards, estimated 300-600 dpi (TIFF or PNG)
 *    - Likely scanned from vintage pre-1971 deck (Pam-A or Pam-B)
 *    - Higher resolution than IA but less clear provenance
 *    - Use as quality comparison / augmentation source
 *
 * 3. Steve-P restored Pam-A deck (steve-p.org/cards/RWSa.html)
 *    - 78 cards + card backs (crackle + roses-and-lilies)
 *    - Scholarly restoration with historical context
 *    - 403 on programmatic access — contact author for permission
 *    - Includes 30+ other deck galleries (Marseille, Golden Dawn, etc.)
 *
 * SECONDARY (multi-deck, Phase 2+):
 *
 * 4. WOPC (wopc.co.uk) — reference catalog, not image database
 *    - 50+ deck traditions documented with sample images
 *    - Visconti-Sforza, Marseille variants, Egyptian Kier, Thoth
 *    - Use for identifying WHICH decks exist, not for bulk images
 *
 * 5. Picryl Sola Busca collection — public domain, 1491 deck
 * 6. Morgan Library Visconti-Sforza digitizations — 35 of ~74 surviving
 * 7. HuggingFace jtatman/tarot_dataset — 1,120 Marseille-style images
 * 8. HuggingFace multimodalart RWS — 78 cards with captions
 *
 * BLOCKED:
 * - Thoth/Crowley-Harris: under copyright until 2032+ (EU/UK)
 *   Cannot use for training without commercial license from Ordo Templi Orientis
 *
 * COPYRIGHT STATUS:
 * Original 1909 PCS artwork: PUBLIC DOMAIN worldwide (life+70 expired Jan 2022)
 * US Games 1971 recolored edition: COPYRIGHTED (avoid these specific modifications)
 * Faithful scans of pre-1971 cards: PUBLIC DOMAIN (Bridgeman v. Corel, 1999)
 * Card names, meanings, spreads: NOT COPYRIGHTABLE (facts/systems)
 * "Rider-Waite®": TRADEMARK only — affects product naming, not ML training
 */

export interface TrainingDataConfig {
  /** Deck identifier matching DeckSystem type */
  deckSystem: string;

  /** Source images: path to directory of clean card scans */
  sourceDir: string;

  /** Number of source images per card (minimum) */
  minSourcesPerCard: number;

  /** Target synthetic images per card after augmentation */
  syntheticPerCard: number;

  /** Whether to generate reversed orientation variants */
  generateReversed: boolean;

  /** Classification mode: 78-class (upright only) or 156-class (upright + reversed) */
  classCount: 78 | 156;

  /** Background images for compositing */
  backgroundsDir: string;

  /** Output resolution for training images */
  outputSize: { width: number; height: number };
}

/**
 * Default config for RWS Phase 1 training
 */
export const RWS_TRAINING_CONFIG: TrainingDataConfig = {
  deckSystem: 'rws',
  sourceDir: './training-data/rws/sources/',
  minSourcesPerCard: 1,       // high-res scan is sufficient with augmentation
  syntheticPerCard: 200,       // 200 augmented images per card × 156 classes = 31,200 total
  generateReversed: true,
  classCount: 156,             // Approach A: upright + reversed as distinct classes
  backgroundsDir: './training-data/backgrounds/',
  outputSize: { width: 224, height: 224 },  // EfficientNet-B0 input
};

/**
 * Augmentation pipeline specification
 * Applied to each source image to generate synthetic training data
 */
export const AUGMENTATION_PIPELINE = {
  // Geometric transforms
  rotation: { min: -15, max: 15, probability: 0.8 },
  perspectiveWarp: { maxAngle: 10, probability: 0.6 },
  scale: { min: 0.8, max: 1.2, probability: 0.5 },

  // Color/lighting transforms
  brightness: { min: 0.7, max: 1.3, probability: 0.7 },
  contrast: { min: 0.8, max: 1.2, probability: 0.5 },
  saturation: { min: 0.7, max: 1.3, probability: 0.4 },
  colorJitter: { hueShift: 10, probability: 0.3 },

  // Noise and blur
  gaussianBlur: { maxKernel: 3, probability: 0.3 },
  gaussianNoise: { maxSigma: 15, probability: 0.2 },
  jpegCompression: { minQuality: 70, probability: 0.2 },

  // Occlusion and wear
  partialOcclusion: { maxPercent: 0.15, probability: 0.2 },
  shadowCasting: { probability: 0.4 },
  cardWear: { scratchProbability: 0.1, fadeProbability: 0.1 },

  // Background compositing
  backgroundComposite: { probability: 1.0 },  // always composite onto background
  backgroundTypes: ['wood', 'cloth', 'marble', 'felt', 'table', 'hand'],
};

/**
 * ML model architecture spec (aligned with Unified Architecture doc)
 *
 * Stage 1: Card Detection — YOLOv8-nano
 *   Input: photograph of physical spread
 *   Output: bounding boxes + confidence for each detected card
 *   Training: synthetic spreads (2-15 cards composited onto surfaces)
 *   Target: >95% mAP@0.5 on real spreads
 *
 * Stage 2: Card Classification — EfficientNet-B0
 *   Input: cropped, perspective-rectified card image (224×224)
 *   Output: class probabilities for 156 classes (78 upright + 78 reversed)
 *   Training: augmented scans composited on backgrounds
 *   Target: >95% top-1 on RWS, >85% confidence threshold for auto-classify
 *
 * Stage 3: Layout Analysis — Procrustes/Hausdorff matching
 *   Input: (x,y) coordinates of detected card centers
 *   Output: best-matching SpreadTemplate + position assignments
 *   No training needed — geometric algorithm against spread templates
 *
 * Deployment: TensorFlow.js on-device (browser)
 *   Detection model: ~3-5MB (INT8 quantized YOLOv8-nano)
 *   Classification model: ~5-10MB (INT8 quantized EfficientNet-B0)
 *   Total on-device: ~8-15MB, lazy-loaded on first camera access
 *   Inference: <500ms on mid-range mobile
 *
 * Training hardware: Desktop workstation (Ryzen 9 5950X, RTX 4070 Ti Super)
 *   Export pipeline: PyTorch → ONNX → TF SavedModel → TF.js (tfjs-converter)
 */

/**
 * Phase plan for multi-deck recognition
 *
 * Phase 1 (launch): RWS only
 *   - Sources: Internet Archive + MediaFire archive
 *   - 156 classes (upright + reversed)
 *   - ~31,200 synthetic training images
 *   - Single classification head
 *
 * Phase 2: Marseille
 *   - Sources: HuggingFace jtatman + Noblet/Dodal scans from BnF
 *   - Shared backbone, new classification head
 *   - Marseille pip cards are non-scenic — different classification challenge
 *
 * Phase 3: Historical decks (Visconti-Sforza, Sola Busca)
 *   - Sources: Morgan Library, Picryl, museum digitizations
 *   - Fewer cards (incomplete historical decks) — handle gracefully
 *
 * Phase 4: Community deck submissions (premium)
 *   - User photographs reference cards → fine-tunes personal classification head
 *   - Transfer learning from shared backbone: ~10 images per card sufficient
 *   - Classification head stored per-user in Supabase storage
 *
 * BLOCKED: Thoth deck recognition delayed until copyright resolution (2032+)
 *   - Architecture supports it (swappable heads)
 *   - Training data cannot be legally assembled yet
 *   - Steve-P hosts Golden Dawn tradition decks that may serve as interim
 */

import { useState, useEffect } from "react";
import { useReading } from "../hooks/useReading";
import { useCardBack } from "../hooks/useCardBack";
import { SPREAD_LIBRARY } from "../arcana/spread/templates";
import { GenerativeCardBack } from "./GenerativeCardBack";

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const GOLD = "var(--df-gold)";
const GOLD_HEX = "#C9A84C"; // raw hex for opacity suffixes (CSS vars don't work with hex alpha)
const DIM = "var(--df-text-dim)";
const BG = "var(--df-surface)";
const BORDER = "var(--df-border)";

const DOMAINS = ["love", "career", "spiritual", "health", "creative", "family", "financial", "self"];
const TONES = { practical: "PRACTICAL", esoteric: "ESOTERIC", poetic: "POETIC", analytical: "ANALYTICAL" };
const SHUFFLES = { riffle: "RIFFLE", overhand: "OVERHAND", wash: "WASH", hindu: "HINDU", pile: "PILE", cut: "CUT" };
const PULLS = { top: "TOP", fan: "FAN", cut_reveal: "CUT & REVEAL" };

const PLACEHOLDERS = [
  "What\u2019s on your mind?",
  "Ask what you need to know.",
  "Or leave this empty and let the cards speak.",
  "What question have you been carrying?",
];

const DRAW_STATUSES = ["Shuffling the deck\u2026", "Reading the field\u2026", "Drawing cards\u2026"];

const KEYFRAMES = `
@keyframes arcana-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes arcana-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes arcana-pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes arcana-shuffle{
  0%{transform:translateX(0) translateY(0) rotate(0deg)}
  20%{transform:translateX(-4px) translateY(-1px) rotate(-2deg)}
  40%{transform:translateX(3px) translateY(1px) rotate(1.5deg)}
  60%{transform:translateX(-2px) translateY(-0.5px) rotate(-1deg)}
  80%{transform:translateX(1px) translateY(0.5px) rotate(0.5deg)}
  100%{transform:translateX(0) translateY(0) rotate(0deg)}
}
@keyframes arcana-shuffle-alt{
  0%{transform:translateX(0) translateY(0) rotate(0deg)}
  20%{transform:translateX(5px) translateY(1px) rotate(2.5deg)}
  40%{transform:translateX(-4px) translateY(-1px) rotate(-2deg)}
  60%{transform:translateX(2px) translateY(0.5px) rotate(1deg)}
  80%{transform:translateX(-1px) translateY(-0.5px) rotate(-0.5deg)}
  100%{transform:translateX(0) translateY(0) rotate(0deg)}
}
@keyframes arcana-breathe{0%,100%{opacity:.3;transform:scale(.97)}50%{opacity:.55;transform:scale(1.01)}}
@keyframes arcana-glow{0%{box-shadow:0 0 0 0 rgba(201,168,76,0)}40%{box-shadow:0 0 16px 3px rgba(201,168,76,.35)}100%{box-shadow:0 0 0 0 rgba(201,168,76,0)}}
`;

// ── HELPERS ──────────────────────────────────────────────────────────────────

function Section({ title, children, style: s, gold }) {
  return (
    <div style={{ background: BG, border: `1px solid ${gold ? `${GOLD_HEX}55` : BORDER}`, borderRadius: 8, padding: 14, marginBottom: 12, ...s }}>
      {title && <div style={{ fontSize: 9, letterSpacing: 2, color: DIM, marginBottom: 10 }}>{title}</div>}
      {children}
    </div>
  );
}

function Btn({ children, onClick, color = GOLD, colorHex = GOLD_HEX, full, small, dim, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      width: full ? "100%" : "auto",
      padding: small ? "5px 12px" : "9px 20px",
      borderRadius: 5, background: dim ? "transparent" : `${colorHex}12`,
      border: `1px solid ${colorHex}${dim ? "30" : "40"}`,
      color: dim ? DIM : disabled ? "var(--df-text-ghost)" : color,
      fontSize: small ? 9 : 10, letterSpacing: small ? 1 : 2,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "inherit", transition: "all 0.2s",
      opacity: disabled ? 0.5 : 1,
    }}>{children}</button>
  );
}

function Pill({ label, active, onClick, locked }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-block", padding: "4px 10px", borderRadius: 12,
      background: active ? `${GOLD_HEX}20` : "transparent",
      border: `1px solid ${active ? GOLD : "var(--df-text-ghost)"}`,
      color: active ? GOLD : locked ? "var(--df-text-ghost)" : DIM,
      fontSize: 9, letterSpacing: 1, cursor: "pointer",
      fontFamily: "inherit", transition: "all 0.2s",
      marginRight: 6, marginBottom: 6,
    }}>{locked ? "\uD83D\uDD12 " : ""}{label}</button>
  );
}

function CardBack({ size = 140, field, cardBackUrl, style: s }) {
  return (
    <div style={{
      width: size, height: size * 1.56, borderRadius: 5,
      overflow: "hidden",
      border: `1.5px solid ${GOLD_HEX}50`,
      ...s,
    }}>
      {cardBackUrl ? (
        <img src={cardBackUrl} alt="Card back" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <GenerativeCardBack width={size} field={field} />
      )}
    </div>
  );
}

function DeckStack({ cardCount = 5, size = 124, shuffling, field, cardBackUrl }) {
  return (
    <div style={{ position: "relative", width: size, height: size * 1.56, margin: "0 auto" }}>
      {Array.from({ length: Math.min(cardCount, 6) }, (_, i) => {
        const offset = (cardCount - 1 - i) * 2;
        return (
          <div key={i} style={{
            position: "absolute", top: -offset, left: offset * 0.5,
            animation: shuffling
              ? `${i % 2 === 0 ? "arcana-shuffle" : "arcana-shuffle-alt"} ${0.7 + i * 0.08}s cubic-bezier(.4,0,.2,1) infinite ${i * 0.12}s`
              : undefined,
          }}>
            <CardBack size={size} field={field} cardBackUrl={cardBackUrl} />
          </div>
        );
      })}
    </div>
  );
}

function TarotCard({ cardId, name, revealed, size = 140, orientation, onClick, field, cardBackUrl }) {
  const imgSize = size >= 70 ? "card" : "thumb";
  const reversed = orientation === "reversed" || orientation === "ill_dignified";
  return (
    <div onClick={onClick} style={{
      width: size, height: size * 1.56, perspective: 1000,
      cursor: onClick ? "pointer" : "default", display: "inline-block",
    }}>
      <div style={{
        width: "100%", height: "100%",
        transition: "transform 1.1s cubic-bezier(.4,0,.2,1)",
        transformStyle: "preserve-3d",
        transform: revealed ? "rotateY(0deg)" : "rotateY(180deg)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden", borderRadius: 5, overflow: "hidden",
          border: `1.5px solid ${GOLD_HEX}60`,
        }}>
          <img src={`/cards/${imgSize}/${cardId}.jpg`} alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover",
              transform: reversed ? "rotate(180deg)" : undefined }}
            loading="lazy" />
        </div>
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden", transform: "rotateY(180deg)",
          borderRadius: 5, overflow: "hidden",
          border: `1.5px solid ${GOLD_HEX}50`,
        }}>
          {cardBackUrl ? (
            <img src={cardBackUrl} alt="Card back" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <GenerativeCardBack width={size} field={field} />
          )}
        </div>
      </div>
    </div>
  );
}

function SpreadLayout({ drawnCards, template, revealedCount, onCardTap, dealt, field, cardBackUrl }) {
  const { layout } = template;
  const maxW = 530;
  const gap = 12;
  const cardW = Math.min(140, Math.floor((maxW - gap * (layout.cols - 1)) / layout.cols));
  const cardH = cardW * 1.56;
  const totalW = layout.cols * (cardW + gap) - gap;
  const totalH = layout.rows * (cardH + gap + 16) - gap;
  const centerX = (totalW - cardW) / 2;
  const centerY = (totalH - cardH) / 2;

  return (
    <div style={{ position: "relative", width: totalW, height: totalH, margin: "12px auto" }}>
      {layout.cardPlacements.map((p, i) => {
        const dc = drawnCards.find(c => c.positionIndex === p.positionId);
        if (!dc) return null;
        const seq = template.readingFlow.sequence.indexOf(p.positionId);
        const isRevealed = seq < revealedCount;
        const targetX = p.col * (cardW + gap);
        const targetY = p.row * (cardH + gap + 16);
        return (
          <div key={p.positionId} style={{
            position: "absolute",
            left: dealt ? targetX : centerX,
            top: dealt ? targetY : centerY,
            transform: dealt
              ? (p.rotation ? `rotate(${p.rotation}deg) scale(1)` : "scale(1)")
              : `rotate(${(i - 2) * 3}deg) scale(0.9)`,
            transformOrigin: "center center",
            zIndex: dealt ? (p.rotation ? 2 : 1) : (layout.cardPlacements.length - i),
            transition: `left 0.9s cubic-bezier(.34,1.3,.64,1) ${seq * 0.18}s, top 0.9s cubic-bezier(.34,1.3,.64,1) ${seq * 0.18}s, transform 0.9s cubic-bezier(.34,1.3,.64,1) ${seq * 0.18}s, opacity 0.6s ease ${seq * 0.18}s`,
            opacity: dealt ? 1 : 0.7,
          }}>
            <div style={{
              animation: isRevealed ? "arcana-glow 1.2s ease forwards" : undefined,
              borderRadius: 4,
            }}>
              <TarotCard cardId={dc.card.id} name={dc.card.name}
                revealed={isRevealed} size={cardW} orientation={dc.orientation}
                field={field} cardBackUrl={cardBackUrl}
                onClick={isRevealed ? () => onCardTap(dc) : undefined} />
            </div>
            <div style={{
              fontSize: 9, color: DIM, textAlign: "center", letterSpacing: 1,
              marginTop: 2, width: cardW, whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
              opacity: dealt ? 1 : 0,
              transition: `opacity 0.5s ease ${seq * 0.18 + 0.6}s`,
            }}>{dc.positionName?.toUpperCase()}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function ArcanaTab({ isPremium, onUpgrade, field, initialQuestion, onInitialQuestionConsumed, sessionContext, onReadingSaved }) {
  const {
    phase, question, domainTags, settings, reading, error, isProcessing, limits,
    journal,
    startReading, setQuestion, toggleDomainTag, updateSettings,
    proceedToSettings, executeReading, saveReading, resetReading, setPhase,
    setJournal,
  } = useReading();

  const { cardBackUrl } = useCardBack();

  const [revealedCount, setRevealedCount] = useState(0);
  const [dealt, setDealt] = useState(false);
  const [showNarrative, setShowNarrative] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [drawStatus, setDrawStatus] = useState(0);
  const [showFieldState, setShowFieldState] = useState(false);
  const [showJournal, setShowJournal] = useState(false);

  // Consume initialQuestion from cross-tab bridge
  useEffect(() => {
    if (initialQuestion != null && phase === "idle") {
      startReading();
      if (initialQuestion) setQuestion(initialQuestion);
      onInitialQuestionConsumed?.();
    }
  }, [initialQuestion]);

  // Rotate placeholder text
  useEffect(() => {
    if (phase !== "questioning") return;
    const t = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 3000);
    return () => clearInterval(t);
  }, [phase]);

  // Cycle draw status
  useEffect(() => {
    if (phase !== "drawing") return;
    setDrawStatus(0);
    const t = setInterval(() => setDrawStatus(i => (i + 1) % DRAW_STATUSES.length), 1200);
    return () => clearInterval(t);
  }, [phase]);

  // Deal + reveal animation sequence
  useEffect(() => {
    if (phase !== "reading" || !reading) return;
    setRevealedCount(0);
    setDealt(false);
    setShowNarrative(false);
    setExpandedCard(null);

    const total = reading.drawnCards.length;
    const dealDuration = total * 180 + 900; // time for all cards to land (slower deal)
    const timers = [];

    // Step 1: Trigger deal animation (cards fly to positions)
    timers.push(setTimeout(() => setDealt(true), 80));

    // Step 2: Begin sequential reveal after cards have landed
    timers.push(setTimeout(() => {
      let count = 0;
      const iv = setInterval(() => {
        count++;
        setRevealedCount(count);
        if (count >= total) {
          clearInterval(iv);
          const nt = setTimeout(() => setShowNarrative(true), 700);
          timers.push(nt);
        }
      }, 1000);
      timers.push(iv);
    }, dealDuration));

    return () => timers.forEach(id => { clearTimeout(id); clearInterval(id); });
  }, [phase, reading?.readingId]);

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ═══ IDLE ═══ */}
      {phase === "idle" && (
        <Section title="ARCANA ENGINE" gold>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ marginBottom: 16, animation: "arcana-breathe 4s ease infinite" }}>
              <DeckStack cardCount={3} size={88} field={field} cardBackUrl={cardBackUrl} />
            </div>
            <div style={{ fontSize: 11, color: GOLD, letterSpacing: 2, marginBottom: 8 }}>
              DRIFTFIELD ARCANA
            </div>
            <div style={{ fontSize: 10, color: "var(--df-text-muted)", lineHeight: 1.6, maxWidth: 280, margin: "0 auto 16px" }}>
              Entropy-driven tarot readings. The field shapes the draw.
              Every card carries the weight of cryptographic chance.
            </div>
            <Btn onClick={startReading} full>NEW READING</Btn>
          </div>
        </Section>
      )}

      {/* ═══ QUESTIONING ═══ */}
      {phase === "questioning" && (
        <Section title="WHAT DRAWS YOU HERE?">
          <textarea value={question} onChange={e => setQuestion(e.target.value)}
            placeholder={PLACEHOLDERS[placeholderIdx]} rows={3}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "var(--df-surface-alt)", border: `1px solid ${GOLD_HEX}20`,
              borderRadius: 5, padding: 10, color: "var(--df-text)",
              fontSize: 11, fontFamily: "inherit", resize: "none",
              outline: "none", lineHeight: 1.6,
            }} />
          {/* Probe intention suggestion */}
          {sessionContext?.activeProbeIntention && !question && (
            <div style={{ marginTop: 6, marginBottom: 4 }}>
              <button onClick={() => setQuestion(sessionContext.activeProbeIntention)} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 10px", borderRadius: 4, fontSize: 9,
                background: `${GOLD_HEX}10`, border: `1px solid ${GOLD_HEX}25`,
                color: GOLD, cursor: "pointer", fontFamily: "inherit",
                letterSpacing: 0.5, maxWidth: "100%",
              }}>
                <span style={{ opacity: 0.5 }}>From your probe:</span> "{sessionContext.activeProbeIntention.slice(0, 60)}{sessionContext.activeProbeIntention.length > 60 ? "..." : ""}"
                <span style={{ fontSize: 8, opacity: 0.7, marginLeft: 4 }}>USE THIS</span>
              </button>
            </div>
          )}
          <div style={{ fontSize: 9, color: DIM, marginTop: 8, marginBottom: 6, letterSpacing: 1 }}>
            FOCUS AREAS ({domainTags.length}/{limits.arcanaDomainTags})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {DOMAINS.map(d => (
              <Pill key={d} label={d.toUpperCase()} active={domainTags.includes(d)}
                onClick={() => toggleDomainTag(d)} />
            ))}
          </div>
          {/* Suggested focus from logged event categories */}
          {sessionContext?.topEventCategories?.length > 0 && domainTags.length === 0 && (() => {
            const catToDomain = { work: "career", social: "family", creative: "creative", money: "financial", health: "health", love: "love", spiritual: "spiritual" };
            const suggestions = sessionContext.topEventCategories
              .map(cat => catToDomain[cat.toLowerCase()] || DOMAINS.find(d => cat.toLowerCase().includes(d)))
              .filter(Boolean)
              .filter((d, i, arr) => arr.indexOf(d) === i);
            if (suggestions.length === 0) return null;
            return (
              <div style={{ fontSize: 9, color: "var(--df-text-ghost)", marginTop: 4, letterSpacing: 1 }}>
                SUGGESTED FOCUS: {suggestions.map(s => (
                  <button key={s} onClick={() => toggleDomainTag(s)} style={{
                    padding: "2px 8px", borderRadius: 3, fontSize: 9, marginLeft: 4,
                    background: `${GOLD_HEX}10`, border: `1px solid ${GOLD_HEX}20`,
                    color: GOLD, cursor: "pointer", fontFamily: "inherit",
                  }}>{s.toUpperCase()}</button>
                ))}
              </div>
            );
          })()}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn onClick={resetReading} dim small>BACK</Btn>
            <div style={{ flex: 1 }} />
            <Btn onClick={proceedToSettings}>CONTINUE</Btn>
          </div>
        </Section>
      )}

      {/* ═══ CONFIGURING ═══ */}
      {phase === "configuring" && (
        <>
          {error && (
            <Section style={{ borderColor: "var(--df-negative)" }}>
              <div style={{ fontSize: 10, color: "var(--df-negative)" }}>{error}</div>
            </Section>
          )}

          <Section title="SPREAD">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SPREAD_LIBRARY.map(s => {
                const locked = !isPremium && s.tier === "premium";
                const selected = settings.spreadId === s.id;
                return (
                  <button key={s.id} onClick={() => {
                    if (locked) { onUpgrade(); return; }
                    updateSettings({ spreadId: s.id });
                  }} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 5,
                    background: selected ? `${GOLD_HEX}15` : "transparent",
                    border: `1px solid ${selected ? GOLD : locked ? "var(--df-text-ghost)" : "var(--df-text-ghost)"}`,
                    cursor: "pointer", opacity: locked ? 0.5 : 1, transition: "all 0.2s",
                  }}>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{
                        fontSize: 10, fontFamily: "inherit", letterSpacing: 1,
                        color: selected ? GOLD : locked ? "var(--df-text-faint)" : "var(--df-text-secondary)",
                      }}>{s.name.toUpperCase()}</div>
                      <div style={{ fontSize: 9, color: DIM, marginTop: 2 }}>
                        {s.cardCount} card{s.cardCount > 1 ? "s" : ""} &middot; {s.category}
                      </div>
                    </div>
                    {locked && <span style={{ fontSize: 9, color: "var(--df-text-muted)", letterSpacing: 1 }}>PREMIUM</span>}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="TONE">
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {Object.entries(TONES).map(([key, label]) => {
                const locked = !isPremium && key !== "practical";
                return (
                  <Pill key={key} label={label} active={settings.tone === key} locked={locked}
                    onClick={() => { if (locked) { onUpgrade(); return; } updateSettings({ tone: key }); }} />
                );
              })}
            </div>
          </Section>

          <Section title="SHUFFLE &middot; PULL">
            <div style={{ fontSize: 9, color: DIM, marginBottom: 6, letterSpacing: 1 }}>SHUFFLE</div>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 10 }}>
              {Object.entries(SHUFFLES).map(([key, label]) => (
                <Pill key={key} label={label} active={settings.shuffleMethod === key}
                  onClick={() => updateSettings({ shuffleMethod: key })} />
              ))}
            </div>
            <div style={{ fontSize: 9, color: DIM, marginBottom: 6, letterSpacing: 1 }}>PULL</div>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 10 }}>
              {Object.entries(PULLS).map(([key, label]) => (
                <Pill key={key} label={label} active={settings.pullMethod === key}
                  onClick={() => updateSettings({ pullMethod: key })} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => updateSettings({ reversalsEnabled: !settings.reversalsEnabled })} style={{
                width: 32, height: 18, borderRadius: 9, border: "none", cursor: "pointer",
                background: settings.reversalsEnabled ? `${GOLD_HEX}40` : "var(--df-text-ghost)",
                position: "relative", transition: "background 0.2s",
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 7,
                  background: settings.reversalsEnabled ? GOLD : "var(--df-text-dim)",
                  position: "absolute", top: 2,
                  left: settings.reversalsEnabled ? 16 : 2,
                  transition: "all 0.2s",
                }} />
              </button>
              <span style={{ fontSize: 9, color: DIM, letterSpacing: 1 }}>REVERSALS</span>
            </div>
          </Section>

          <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
            <Btn onClick={() => setPhase("questioning")} dim small>BACK</Btn>
            <button onClick={() => {
              try { localStorage.setItem("df_df_reading_defaults", JSON.stringify(settings)); } catch {}
            }} style={{
              background: "transparent", border: "none", color: "var(--df-text-faint)", fontSize: 9,
              cursor: "pointer", fontFamily: "inherit", letterSpacing: 1, padding: "4px 8px",
            }}>SAVE DEFAULTS</button>
            <div style={{ flex: 1 }} />
            <Btn onClick={() => executeReading({
              recentPatterns: sessionContext?.recentPatterns,
              lastReadingCards: sessionContext?.lastReadingCards,
              recentJournalExcerpt: sessionContext?.recentJournalExcerpt,
            })}>DRAW CARDS</Btn>
          </div>
        </>
      )}

      {/* ═══ DRAWING ═══ */}
      {phase === "drawing" && (
        <Section gold style={{ textAlign: "center", padding: "30px 14px" }}>
          <div style={{ marginBottom: 20 }}>
            <DeckStack cardCount={5} size={105} shuffling field={field} cardBackUrl={cardBackUrl} />
          </div>
          <div style={{
            fontSize: 10, color: GOLD, letterSpacing: 2, marginBottom: 8,
            animation: "arcana-pulse 1.5s ease infinite",
          }}>{DRAW_STATUSES[drawStatus]}</div>
          {field && (
            <div style={{ fontSize: 9, color: "var(--df-text-faint)", letterSpacing: 1, marginTop: 12 }}>
              FIELD {field.polarity > 0 ? "+" : ""}{field.polarity?.toFixed?.(2) ?? "0.00"} &middot;{" "}
              {field.bearing?.toFixed?.(0) ?? "0"}&deg; {(field.element || field.bearingElement || "").toUpperCase()}
            </div>
          )}
        </Section>
      )}

      {/* ═══ READING ═══ */}
      {phase === "reading" && reading && (
        <>
          <Section gold>
            <div style={{ fontSize: 9, color: DIM, letterSpacing: 1, marginBottom: 4 }}>
              {reading.spreadTemplate.name.toUpperCase()} &middot;{" "}
              {new Date(reading.timestamp).toLocaleDateString()}
            </div>
            <SpreadLayout drawnCards={reading.drawnCards} template={reading.spreadTemplate}
              revealedCount={revealedCount} dealt={dealt} field={field} cardBackUrl={cardBackUrl} onCardTap={setExpandedCard} />
            {revealedCount > 0 && !expandedCard && (
              <div style={{ textAlign: "center", fontSize: 9, color: "var(--df-text-faint)", letterSpacing: 1 }}>
                TAP A CARD FOR DETAILS
              </div>
            )}
          </Section>

          {expandedCard && (() => {
            const rc = reading.resolvedCards.find(r => r.card.card.id === expandedCard.card.id);
            return (
              <Section style={{ borderColor: `${GOLD_HEX}30`, animation: "arcana-fade 0.3s ease" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <img src={`/cards/card/${expandedCard.card.id}.jpg`} alt={expandedCard.card.name}
                    style={{
                      width: 175, height: 273, objectFit: "cover", borderRadius: 5,
                      border: `1px solid ${GOLD_HEX}30`, flexShrink: 0,
                      transform: (expandedCard.orientation === "reversed" || expandedCard.orientation === "ill_dignified")
                        ? "rotate(180deg)" : undefined,
                    }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: GOLD, letterSpacing: 1 }}>
                      {expandedCard.card.name.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 9, color: DIM, marginTop: 2, letterSpacing: 1 }}>
                      {expandedCard.positionName} &middot; {expandedCard.orientation.toUpperCase()}
                    </div>
                    {expandedCard.card.element && (
                      <div style={{ fontSize: 9, color: "var(--df-text-faint)", marginTop: 4 }}>
                        {expandedCard.card.element.toUpperCase()}
                        {expandedCard.card.zodiac && ` \u00B7 ${expandedCard.card.zodiac}`}
                        {expandedCard.card.planet && ` \u00B7 ${expandedCard.card.planet}`}
                      </div>
                    )}
                    {rc && (
                      <div style={{ fontSize: 10, color: "var(--df-text-secondary)", marginTop: 8, lineHeight: 1.7 }}>
                        {rc.interpretation.core}
                      </div>
                    )}
                  </div>
                </div>
                {rc && (
                  <div style={{ borderTop: `1px solid ${GOLD_HEX}15`, paddingTop: 10 }}>
                    {rc.interpretation.advice && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 9, color: GOLD, letterSpacing: 1, marginBottom: 3 }}>GUIDANCE</div>
                        <div style={{ fontSize: 10, color: "var(--df-text-secondary)", lineHeight: 1.6 }}>{rc.interpretation.advice}</div>
                      </div>
                    )}
                    {rc.interpretation.warning && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 9, color: "var(--df-negative)", letterSpacing: 1, marginBottom: 3 }}>WATCH FOR</div>
                        <div style={{ fontSize: 10, color: "var(--df-text-secondary)", lineHeight: 1.6 }}>{rc.interpretation.warning}</div>
                      </div>
                    )}
                    {rc.interpretation.affirmation && (
                      <div style={{ marginBottom: 4 }}>
                        <div style={{ fontSize: 9, color: "#2ecc71", letterSpacing: 1, marginBottom: 3 }}>AFFIRMATION</div>
                        <div style={{ fontSize: 10, color: "var(--df-text-secondary)", lineHeight: 1.6, fontStyle: "italic" }}>{rc.interpretation.affirmation}</div>
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => setExpandedCard(null)} style={{
                  display: "block", margin: "10px auto 0", padding: "5px 16px",
                  background: "transparent", border: `1px solid ${GOLD_HEX}30`, borderRadius: 4,
                  color: DIM, fontSize: 9, cursor: "pointer", fontFamily: "inherit", letterSpacing: 1,
                }}>CLOSE</button>
              </Section>
            );
          })()}

          {showNarrative && (
            <div style={{ animation: "arcana-fade 0.6s ease" }}>
              {/* Tier C (API) narrative — flowing prose */}
              {reading.apiNarrative ? (
                <Section title="YOUR READING">
                  <div style={{ fontSize: 11, color: "var(--df-text)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                    {reading.apiNarrative}
                  </div>
                </Section>
              ) : (
                /* Tier A (template) narrative — structured sections */
                <>
                  <Section title="YOUR READING">
                    <div style={{ fontSize: 11, color: "var(--df-text)", lineHeight: 1.7 }}>
                      <p style={{ margin: "0 0 14px" }}>{reading.narrative.opening}</p>
                      <p style={{ margin: "0 0 6px", color: "var(--df-text-secondary)" }}>{reading.narrative.spreadOverview}</p>
                    </div>
                  </Section>

                  {reading.narrative.cardReadings.map((cr, i) => (
                    <Section key={i} style={{ borderColor: `${GOLD_HEX}15` }}>
                      <div style={{ fontSize: 9, color: GOLD, letterSpacing: 1, marginBottom: 6 }}>
                        {cr.positionName.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--df-text)", letterSpacing: 0.5, marginBottom: 8 }}>
                        {cr.cardName}
                        <span style={{ color: DIM, fontSize: 9, marginLeft: 6 }}>{cr.orientation}</span>
                      </div>
                      <p style={{ margin: "0 0 10px", fontSize: 10, color: "var(--df-text-secondary)", lineHeight: 1.7 }}>
                        {cr.narrative}
                      </p>
                      {cr.advice && (
                        <p style={{ margin: "0 0 6px", fontSize: 10, color: "var(--df-text-secondary)", lineHeight: 1.6, fontStyle: "italic",
                          borderLeft: `2px solid ${GOLD_HEX}30`, paddingLeft: 10 }}>
                          {cr.advice}
                        </p>
                      )}
                    </Section>
                  ))}

                  <Section>
                    <p style={{ margin: "0 0 12px", fontSize: 11, color: "var(--df-text)", lineHeight: 1.7 }}>
                      {reading.narrative.synthesis}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, fontStyle: "italic", color: "var(--df-text-muted)", lineHeight: 1.6 }}>
                      {reading.narrative.closing}
                    </p>
                  </Section>
                </>
              )}

              {/* Notes: field charged, patterns — shown inline if present */}
              {(reading.narrative.fieldNote || reading.narrative.patternNote || reading.patterns?.length > 0) && (
                <Section style={{ borderColor: `${GOLD_HEX}20` }}>
                  {reading.narrative.fieldNote && (
                    <p style={{ margin: "0 0 8px", fontSize: 10, color: `${GOLD_HEX}90`, lineHeight: 1.6 }}>{reading.narrative.fieldNote}</p>
                  )}
                  {reading.narrative.patternNote && (
                    <p style={{ margin: "0 0 8px", fontSize: 10, color: "var(--df-text-secondary)", lineHeight: 1.6 }}>{reading.narrative.patternNote}</p>
                  )}
                  {reading.patterns?.map((p, i) => (
                    <p key={i} style={{ margin: "0 0 6px", fontSize: 10, color: "var(--df-text-secondary)", lineHeight: 1.6 }}>{p}</p>
                  ))}
                </Section>
              )}

              {/* Field State — collapsed by default */}
              <div style={{ marginBottom: 12 }}>
                <button onClick={() => setShowFieldState(f => !f)} style={{
                  display: "flex", alignItems: "center", gap: 6, width: "100%",
                  background: "transparent", border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: "8px 14px", cursor: "pointer",
                  color: DIM, fontSize: 9, letterSpacing: 2, fontFamily: "inherit",
                }}>
                  <span style={{ transform: showFieldState ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>{"\u25B6"}</span>
                  ENTROPY DATA
                  {reading.fieldSnapshot.isCharged && <span style={{ color: GOLD, marginLeft: "auto" }}>{"\u26A1"} CHARGED</span>}
                </button>
                {showFieldState && (
                  <div style={{ background: BG, border: `1px solid ${BORDER}`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: 14, animation: "arcana-fade 0.3s ease" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        ["POLARITY", `${reading.fieldSnapshot.polarity > 0 ? "+" : ""}${reading.fieldSnapshot.polarity.toFixed(3)}`],
                        ["ANOMALY", `${reading.fieldSnapshot.anomalySigma.toFixed(2)}\u03C3`],
                        ["BEARING", `${reading.fieldSnapshot.bearing.toFixed(0)}\u00B0 ${reading.fieldSnapshot.bearingElement.toUpperCase()}`],
                        ["SHANNON", reading.fieldSnapshot.entropy.shannon.toFixed(4)],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div style={{ fontSize: 9, color: DIM, letterSpacing: 1 }}>{label}</div>
                          <div style={{ fontSize: 11, color: reading.fieldSnapshot.isCharged ? GOLD : "var(--df-text-secondary)", fontFamily: "inherit" }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Journal — collapsed by default */}
              <div style={{ marginBottom: 12 }}>
                <button onClick={() => setShowJournal(j => !j)} style={{
                  display: "flex", alignItems: "center", gap: 6, width: "100%",
                  background: "transparent", border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: "8px 14px", cursor: "pointer",
                  color: DIM, fontSize: 9, letterSpacing: 2, fontFamily: "inherit",
                }}>
                  <span style={{ transform: showJournal ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>{"\u25B6"}</span>
                  JOURNAL
                  {journal && <span style={{ color: "var(--df-text-muted)", marginLeft: "auto", fontSize: 9 }}>HAS ENTRY</span>}
                </button>
                {showJournal && (
                  <div style={{ background: BG, border: `1px solid ${BORDER}`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: 14, animation: "arcana-fade 0.3s ease" }}>
                    <div style={{ fontSize: 9, color: "var(--df-text-dim)", marginBottom: 6 }}>
                      What came up for you? Write it down while it's fresh.
                    </div>
                    <textarea value={journal} onChange={e => setJournal(e.target.value)}
                      placeholder="Your reflections..."
                      rows={3}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        background: "var(--df-surface-alt)", border: `1px solid ${GOLD_HEX}15`,
                        borderRadius: 5, padding: 10, color: "var(--df-text-secondary)",
                        fontSize: 10, fontFamily: "inherit", resize: "vertical",
                        outline: "none", lineHeight: 1.6,
                      }} />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Btn onClick={() => saveReading()} full>SAVE READING</Btn>
              </div>
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <Btn onClick={resetReading} dim small>NEW READING</Btn>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ SAVED ═══ */}
      {phase === "saved" && (
        <Section gold style={{ textAlign: "center", padding: "30px 14px" }}>
          <div style={{ fontSize: 24, marginBottom: 12, color: GOLD }}>{"\u2713"}</div>
          <div style={{ fontSize: 10, color: GOLD, letterSpacing: 2, marginBottom: 4 }}>READING SAVED</div>
          <div style={{ fontSize: 9, color: DIM, marginBottom: 8 }}>
            {reading?.spreadTemplate?.name} &middot; {reading?.drawnCards?.length} card{reading?.drawnCards?.length > 1 ? "s" : ""}
            {journal && " \u00B7 journal entry saved"}
          </div>
          {reading?.patterns?.length > 0 && (
            <div style={{ fontSize: 9, color: "var(--df-text-muted)", marginBottom: 12, textAlign: "left", padding: "8px 0", borderTop: `1px solid ${GOLD_HEX}15` }}>
              <div style={{ fontSize: 9, color: DIM, letterSpacing: 1, marginBottom: 4, textAlign: "center" }}>PATTERNS DETECTED</div>
              {reading.patterns.map((p, i) => <div key={i} style={{ marginBottom: 4 }}>{p}</div>)}
            </div>
          )}
          {onReadingSaved && (
            <div style={{ marginBottom: 10 }}>
              <Btn onClick={() => {
                onReadingSaved({
                  spreadName: reading?.spreadTemplate?.name,
                  cards: reading?.drawnCards?.map(dc => ({ name: dc.card.name, orientation: dc.orientation, positionName: dc.positionName })),
                  question: question || undefined,
                  isCharged: reading?.fieldSnapshot?.isCharged || false,
                });
              }} full dim>LOG WHAT CAME UP</Btn>
            </div>
          )}
          <Btn onClick={resetReading} full>NEW READING</Btn>
        </Section>
      )}
    </>
  );
}

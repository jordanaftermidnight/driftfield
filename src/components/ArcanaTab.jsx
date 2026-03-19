import { useState, useEffect } from "react";
import { useReading } from "../hooks/useReading";
import { useCardBack } from "../hooks/useCardBack";
import { SPREAD_LIBRARY } from "../arcana/spread/templates";
import { GenerativeCardBack } from "./GenerativeCardBack";

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const GOLD = "#C9A84C";
const DIM = "#555";
const BG = "#12121e";
const BORDER = "#1e1e35";

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
@keyframes arcana-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes arcana-pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes arcana-shuffle{
  0%{transform:translateX(0) rotate(0deg)}
  25%{transform:translateX(-3px) rotate(-1.5deg)}
  50%{transform:translateX(2px) rotate(1deg)}
  75%{transform:translateX(-1px) rotate(-0.5deg)}
  100%{transform:translateX(0) rotate(0deg)}
}
@keyframes arcana-shuffle-alt{
  0%{transform:translateX(0) rotate(0deg)}
  25%{transform:translateX(4px) rotate(2deg)}
  50%{transform:translateX(-3px) rotate(-1.5deg)}
  75%{transform:translateX(1px) rotate(0.5deg)}
  100%{transform:translateX(0) rotate(0deg)}
}
@keyframes arcana-breathe{0%,100%{opacity:.3;transform:scale(.98)}50%{opacity:.5;transform:scale(1)}}
@keyframes arcana-glow{0%{box-shadow:0 0 0 0 rgba(201,168,76,0)}50%{box-shadow:0 0 12px 2px rgba(201,168,76,.3)}100%{box-shadow:0 0 0 0 rgba(201,168,76,0)}}
`;

// ── HELPERS ──────────────────────────────────────────────────────────────────

function Section({ title, children, style: s, gold }) {
  return (
    <div style={{ background: BG, border: `1px solid ${gold ? `${GOLD}30` : BORDER}`, borderRadius: 8, padding: 14, marginBottom: 12, ...s }}>
      {title && <div style={{ fontSize: 9, letterSpacing: 2, color: DIM, marginBottom: 10 }}>{title}</div>}
      {children}
    </div>
  );
}

function Btn({ children, onClick, color = GOLD, full, small, dim, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      width: full ? "100%" : "auto",
      padding: small ? "5px 12px" : "9px 20px",
      borderRadius: 5, background: dim ? "transparent" : `${color}12`,
      border: `1px solid ${color}${dim ? "30" : "40"}`,
      color: dim ? DIM : disabled ? "#333" : color,
      fontSize: small ? 9 : 10, letterSpacing: small ? 1 : 2,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "monospace", transition: "all 0.2s",
      opacity: disabled ? 0.5 : 1,
    }}>{children}</button>
  );
}

function Pill({ label, active, onClick, locked }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-block", padding: "4px 10px", borderRadius: 12,
      background: active ? `${GOLD}20` : "transparent",
      border: `1px solid ${active ? GOLD : "#333"}`,
      color: active ? GOLD : locked ? "#333" : DIM,
      fontSize: 9, letterSpacing: 1, cursor: "pointer",
      fontFamily: "monospace", transition: "all 0.2s",
      marginRight: 6, marginBottom: 6,
    }}>{locked ? "\uD83D\uDD12 " : ""}{label}</button>
  );
}

function CardBack({ size = 80, field, cardBackUrl, style: s }) {
  return (
    <div style={{
      width: size, height: size * 1.56, borderRadius: 4,
      overflow: "hidden",
      border: `1px solid ${GOLD}20`,
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

function DeckStack({ cardCount = 5, size = 70, shuffling, field, cardBackUrl }) {
  return (
    <div style={{ position: "relative", width: size, height: size * 1.56, margin: "0 auto" }}>
      {Array.from({ length: Math.min(cardCount, 6) }, (_, i) => {
        const offset = (cardCount - 1 - i) * 2;
        return (
          <div key={i} style={{
            position: "absolute", top: -offset, left: offset * 0.5,
            animation: shuffling
              ? `${i % 2 === 0 ? "arcana-shuffle" : "arcana-shuffle-alt"} ${0.4 + i * 0.05}s ease infinite ${i * 0.08}s`
              : undefined,
          }}>
            <CardBack size={size} field={field} cardBackUrl={cardBackUrl} />
          </div>
        );
      })}
    </div>
  );
}

function TarotCard({ cardId, name, revealed, size = 80, orientation, onClick, field, cardBackUrl }) {
  const imgSize = size > 100 ? "card" : "thumb";
  const reversed = orientation === "reversed" || orientation === "ill_dignified";
  return (
    <div onClick={onClick} style={{
      width: size, height: size * 1.56, perspective: 800,
      cursor: onClick ? "pointer" : "default", display: "inline-block",
    }}>
      <div style={{
        width: "100%", height: "100%",
        transition: "transform 0.8s ease",
        transformStyle: "preserve-3d",
        transform: revealed ? "rotateY(0deg)" : "rotateY(180deg)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden", borderRadius: 4, overflow: "hidden",
          border: `1px solid ${GOLD}40`,
        }}>
          <img src={`/cards/${imgSize}/${cardId}.jpg`} alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover",
              transform: reversed ? "rotate(180deg)" : undefined }}
            loading="lazy" />
        </div>
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden", transform: "rotateY(180deg)",
          borderRadius: 4, overflow: "hidden",
          border: `1px solid ${GOLD}20`,
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
  const maxW = 300;
  const gap = 8;
  const cardW = Math.min(80, Math.floor((maxW - gap * (layout.cols - 1)) / layout.cols));
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
            transition: `left 0.6s cubic-bezier(.34,1.56,.64,1) ${seq * 0.12}s, top 0.6s cubic-bezier(.34,1.56,.64,1) ${seq * 0.12}s, transform 0.6s cubic-bezier(.34,1.56,.64,1) ${seq * 0.12}s`,
            opacity: dealt ? 1 : 0.8,
          }}>
            <div style={{
              animation: isRevealed ? "arcana-glow 0.8s ease forwards" : undefined,
              borderRadius: 4,
            }}>
              <TarotCard cardId={dc.card.id} name={dc.card.name}
                revealed={isRevealed} size={cardW} orientation={dc.orientation}
                field={field} cardBackUrl={cardBackUrl}
                onClick={isRevealed ? () => onCardTap(dc) : undefined} />
            </div>
            <div style={{
              fontSize: 7, color: DIM, textAlign: "center", letterSpacing: 1,
              marginTop: 2, width: cardW, whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
              opacity: dealt ? 1 : 0,
              transition: `opacity 0.3s ease ${seq * 0.12 + 0.4}s`,
            }}>{dc.positionName?.toUpperCase()}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function ArcanaTab({ isPremium, onUpgrade, field }) {
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
    const dealDuration = total * 120 + 600; // time for all cards to land
    const timers = [];

    // Step 1: Trigger deal animation (cards fly to positions)
    timers.push(setTimeout(() => setDealt(true), 50));

    // Step 2: Begin sequential reveal after cards have landed
    timers.push(setTimeout(() => {
      let count = 0;
      const iv = setInterval(() => {
        count++;
        setRevealedCount(count);
        if (count >= total) {
          clearInterval(iv);
          const nt = setTimeout(() => setShowNarrative(true), 500);
          timers.push(nt);
        }
      }, 700);
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
              <DeckStack cardCount={3} size={50} field={field} cardBackUrl={cardBackUrl} />
            </div>
            <div style={{ fontSize: 11, color: GOLD, letterSpacing: 2, marginBottom: 8 }}>
              DRIFTFIELD ARCANA
            </div>
            <div style={{ fontSize: 10, color: "#666", lineHeight: 1.6, maxWidth: 280, margin: "0 auto 16px" }}>
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
              background: "#0a0a14", border: `1px solid ${GOLD}20`,
              borderRadius: 5, padding: 10, color: "#ccc",
              fontSize: 11, fontFamily: "monospace", resize: "none",
              outline: "none", lineHeight: 1.6,
            }} />
          <div style={{ fontSize: 8, color: DIM, marginTop: 8, marginBottom: 6, letterSpacing: 1 }}>
            FOCUS AREAS ({domainTags.length}/{limits.arcanaDomainTags})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {DOMAINS.map(d => (
              <Pill key={d} label={d.toUpperCase()} active={domainTags.includes(d)}
                onClick={() => toggleDomainTag(d)} />
            ))}
          </div>
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
            <Section style={{ borderColor: "#c0392b40" }}>
              <div style={{ fontSize: 10, color: "#e74c3c" }}>{error}</div>
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
                    background: selected ? `${GOLD}15` : "transparent",
                    border: `1px solid ${selected ? GOLD : locked ? "#222" : "#333"}`,
                    cursor: "pointer", opacity: locked ? 0.5 : 1, transition: "all 0.2s",
                  }}>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{
                        fontSize: 10, fontFamily: "monospace", letterSpacing: 1,
                        color: selected ? GOLD : locked ? "#444" : "#aaa",
                      }}>{s.name.toUpperCase()}</div>
                      <div style={{ fontSize: 8, color: DIM, marginTop: 2 }}>
                        {s.cardCount} card{s.cardCount > 1 ? "s" : ""} &middot; {s.category}
                      </div>
                    </div>
                    {locked && <span style={{ fontSize: 8, color: "#666", letterSpacing: 1 }}>PREMIUM</span>}
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
            <div style={{ fontSize: 8, color: DIM, marginBottom: 6, letterSpacing: 1 }}>SHUFFLE</div>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 10 }}>
              {Object.entries(SHUFFLES).map(([key, label]) => (
                <Pill key={key} label={label} active={settings.shuffleMethod === key}
                  onClick={() => updateSettings({ shuffleMethod: key })} />
              ))}
            </div>
            <div style={{ fontSize: 8, color: DIM, marginBottom: 6, letterSpacing: 1 }}>PULL</div>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 10 }}>
              {Object.entries(PULLS).map(([key, label]) => (
                <Pill key={key} label={label} active={settings.pullMethod === key}
                  onClick={() => updateSettings({ pullMethod: key })} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => updateSettings({ reversalsEnabled: !settings.reversalsEnabled })} style={{
                width: 32, height: 18, borderRadius: 9, border: "none", cursor: "pointer",
                background: settings.reversalsEnabled ? `${GOLD}40` : "#222",
                position: "relative", transition: "background 0.2s",
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 7,
                  background: settings.reversalsEnabled ? GOLD : "#555",
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
              background: "transparent", border: "none", color: "#444", fontSize: 8,
              cursor: "pointer", fontFamily: "monospace", letterSpacing: 1, padding: "4px 8px",
            }}>SAVE DEFAULTS</button>
            <div style={{ flex: 1 }} />
            <Btn onClick={executeReading}>DRAW CARDS</Btn>
          </div>
        </>
      )}

      {/* ═══ DRAWING ═══ */}
      {phase === "drawing" && (
        <Section gold style={{ textAlign: "center", padding: "30px 14px" }}>
          <div style={{ marginBottom: 20 }}>
            <DeckStack cardCount={5} size={60} shuffling field={field} cardBackUrl={cardBackUrl} />
          </div>
          <div style={{
            fontSize: 10, color: GOLD, letterSpacing: 2, marginBottom: 8,
            animation: "arcana-pulse 1.5s ease infinite",
          }}>{DRAW_STATUSES[drawStatus]}</div>
          {field && (
            <div style={{ fontSize: 8, color: "#444", letterSpacing: 1, marginTop: 12 }}>
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
            <div style={{ fontSize: 8, color: DIM, letterSpacing: 1, marginBottom: 4 }}>
              {reading.spreadTemplate.name.toUpperCase()} &middot;{" "}
              {new Date(reading.timestamp).toLocaleDateString()}
            </div>
            <SpreadLayout drawnCards={reading.drawnCards} template={reading.spreadTemplate}
              revealedCount={revealedCount} dealt={dealt} field={field} cardBackUrl={cardBackUrl} onCardTap={setExpandedCard} />
            {revealedCount > 0 && !expandedCard && (
              <div style={{ textAlign: "center", fontSize: 7, color: "#444", letterSpacing: 1 }}>
                TAP A CARD FOR DETAILS
              </div>
            )}
          </Section>

          {expandedCard && (() => {
            const rc = reading.resolvedCards.find(r => r.card.card.id === expandedCard.card.id);
            return (
              <Section style={{ borderColor: `${GOLD}30`, animation: "arcana-fade 0.3s ease" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <img src={`/cards/card/${expandedCard.card.id}.jpg`} alt={expandedCard.card.name}
                    style={{
                      width: 100, height: 156, objectFit: "cover", borderRadius: 4,
                      border: `1px solid ${GOLD}30`, flexShrink: 0,
                      transform: (expandedCard.orientation === "reversed" || expandedCard.orientation === "ill_dignified")
                        ? "rotate(180deg)" : undefined,
                    }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: GOLD, letterSpacing: 1 }}>
                      {expandedCard.card.name.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 8, color: DIM, marginTop: 2, letterSpacing: 1 }}>
                      {expandedCard.positionName} &middot; {expandedCard.orientation.toUpperCase()}
                    </div>
                    {expandedCard.card.element && (
                      <div style={{ fontSize: 8, color: "#444", marginTop: 4 }}>
                        {expandedCard.card.element.toUpperCase()}
                        {expandedCard.card.zodiac && ` \u00B7 ${expandedCard.card.zodiac}`}
                        {expandedCard.card.planet && ` \u00B7 ${expandedCard.card.planet}`}
                      </div>
                    )}
                    {rc && (
                      <>
                        <div style={{ fontSize: 9, color: "#888", marginTop: 8, lineHeight: 1.5 }}>
                          {rc.interpretation.core}
                        </div>
                        {rc.interpretation.advice && (
                          <div style={{ fontSize: 9, color: "#777", marginTop: 6, lineHeight: 1.5, fontStyle: "italic" }}>
                            {rc.interpretation.advice}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <button onClick={() => setExpandedCard(null)} style={{
                  display: "block", margin: "10px auto 0", padding: "4px 12px",
                  background: "transparent", border: "1px solid #333", borderRadius: 4,
                  color: DIM, fontSize: 8, cursor: "pointer", fontFamily: "monospace", letterSpacing: 1,
                }}>CLOSE</button>
              </Section>
            );
          })()}

          {showNarrative && (
            <div style={{ animation: "arcana-fade 0.6s ease" }}>
              {/* Tier C (API) narrative — flowing prose */}
              {reading.apiNarrative ? (
                <Section title={<span>THE READING <span style={{ fontSize: 7, color: "#555" }}>&middot; TIER C</span></span>}>
                  <div style={{ fontSize: 10, color: "#bbb", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                    {reading.apiNarrative}
                  </div>
                </Section>
              ) : (
                /* Tier A (template) narrative — structured sections */
                <Section title="THE READING">
                  <div style={{ fontSize: 10, color: "#999", lineHeight: 1.7 }}>
                    <p style={{ margin: "0 0 12px" }}>{reading.narrative.opening}</p>
                    <p style={{ margin: "0 0 12px" }}>{reading.narrative.spreadOverview}</p>

                    {reading.narrative.cardReadings.map((cr, i) => (
                      <div key={i} style={{ margin: "0 0 14px" }}>
                        <div style={{ fontSize: 9, color: GOLD, letterSpacing: 1, marginBottom: 4 }}>
                          {cr.positionName.toUpperCase()} &mdash; {cr.cardName}
                          <span style={{ color: DIM }}> ({cr.orientation})</span>
                        </div>
                        <p style={{ margin: 0 }}>{cr.narrative}</p>
                      </div>
                    ))}

                    <p style={{ margin: "16px 0 12px", color: "#aaa" }}>{reading.narrative.synthesis}</p>
                    <p style={{ margin: 0, fontStyle: "italic", color: "#777" }}>{reading.narrative.closing}</p>
                  </div>
                </Section>
              )}

              {/* Notes: field, patterns */}
              {(reading.narrative.fieldNote || reading.narrative.patternNote || reading.patterns?.length > 0) && (
                <Section>
                  {reading.narrative.fieldNote && (
                    <p style={{ margin: "0 0 8px", fontSize: 9, color: `${GOLD}80` }}>{reading.narrative.fieldNote}</p>
                  )}
                  {reading.narrative.patternNote && (
                    <p style={{ margin: "0 0 8px", fontSize: 9, color: "#777" }}>{reading.narrative.patternNote}</p>
                  )}
                  {reading.patterns?.map((p, i) => (
                    <p key={i} style={{ margin: "0 0 6px", fontSize: 9, color: "#777" }}>{p}</p>
                  ))}
                </Section>
              )}

              <Section title="FIELD STATE">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    ["POLARITY", `${reading.fieldSnapshot.polarity > 0 ? "+" : ""}${reading.fieldSnapshot.polarity.toFixed(3)}`],
                    ["ANOMALY", `${reading.fieldSnapshot.anomalySigma.toFixed(2)}\u03C3`],
                    ["BEARING", `${reading.fieldSnapshot.bearing.toFixed(0)}\u00B0 ${reading.fieldSnapshot.bearingElement.toUpperCase()}`],
                    ["SHANNON", reading.fieldSnapshot.entropy.shannon.toFixed(4)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontSize: 7, color: DIM, letterSpacing: 1 }}>{label}</div>
                      <div style={{ fontSize: 11, color: reading.fieldSnapshot.isCharged ? GOLD : "#aaa", fontFamily: "monospace" }}>{value}</div>
                    </div>
                  ))}
                </div>
                {reading.fieldSnapshot.isCharged && (
                  <div style={{ fontSize: 8, color: GOLD, marginTop: 8, letterSpacing: 1 }}>
                    {"\u26A1"} CHARGED READING
                  </div>
                )}
              </Section>

              {/* Journal */}
              <Section title="JOURNAL">
                <div style={{ fontSize: 9, color: "#555", marginBottom: 6 }}>
                  What came up for you? Write it down while it's fresh.
                </div>
                <textarea value={journal} onChange={e => setJournal(e.target.value)}
                  placeholder="Your reflections..."
                  rows={3}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "#0a0a14", border: `1px solid ${GOLD}15`,
                    borderRadius: 5, padding: 10, color: "#aaa",
                    fontSize: 10, fontFamily: "monospace", resize: "vertical",
                    outline: "none", lineHeight: 1.6,
                  }} />
              </Section>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Btn onClick={() => saveReading()} small>SAVE READING</Btn>
                <div style={{ flex: 1 }} />
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
            <div style={{ fontSize: 9, color: "#777", marginBottom: 12, textAlign: "left", padding: "8px 0", borderTop: `1px solid ${GOLD}15` }}>
              <div style={{ fontSize: 8, color: DIM, letterSpacing: 1, marginBottom: 4, textAlign: "center" }}>PATTERNS DETECTED</div>
              {reading.patterns.map((p, i) => <div key={i} style={{ marginBottom: 4 }}>{p}</div>)}
            </div>
          )}
          <Btn onClick={resetReading} full>NEW READING</Btn>
        </Section>
      )}
    </>
  );
}

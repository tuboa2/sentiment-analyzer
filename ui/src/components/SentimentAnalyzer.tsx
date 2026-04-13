import { useActionState } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";

/* ─────────────────────────────── Types ─────────────────────────────── */
type SentimentResult = {
  sentiment: string;
  probabilities: Record<string, number>;
} | null;

type ActionState = {
  data?: SentimentResult;
  error?: string;
};

/* ─────────────────────────── Server Action ─────────────────────────── */
async function analyzeSentiment(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const text = formData.get("text") as string;
  if (!text?.trim()) return { error: "Input cannot be empty." };
  try {
    const res = await fetch("https://sentiment-analyzer-mlld.onrender.com/analyze-sentiment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const e = await res.json();
      return { error: e.detail || "Server error." };
    }
    const d = await res.json();
    return { data: { sentiment: d.predicted_sentiment, probabilities: d.raw_probabilities } };
  } catch {
    return { error: "Cannot reach API — is it running?" };
  }
}

/* ─────────────────────────── Design Tokens ─────────────────────────── */
const A = "#7CA6E6"; // primary accent
const DARK = "#06080e";

function sentimentStyle(s: string) {
  const l = s.toLowerCase();
  if (l === "positive") return { accent: A,        label: "#fff" };
  if (l === "negative") return { accent: "#F06464", label: "#fff" };
  return                        { accent: "#8B8FA8", label: "#fff" };
}

/* ─────────────────────────────── CSS ───────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

  .nlp-root        { font-family: 'Barlow Condensed', sans-serif; }
  .nlp-mono        { font-family: 'JetBrains Mono', monospace; }
  .nlp-ta          { font-family: 'JetBrains Mono', monospace; resize: none; }
  .nlp-ta::placeholder { color: rgba(124,166,230,0.25); }
  .nlp-ta:focus    { outline: none; border-color: ${A} !important; box-shadow: 0 0 0 3px rgba(124,166,230,0.18); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes barGrow { from { width: 0 } }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes drift   { to { transform: rotate(360deg); } }
  @keyframes ticker  {
    0%   { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  @keyframes scanPulse {
    0%,100% { opacity: 0.03; }
    50%     { opacity: 0.06; }
  }

  .result-appear  { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
  .bar-fill       { animation: barGrow 0.9s cubic-bezier(0.16,1,0.3,1) both; }
  .cursor-blink   { animation: blink 1.1s step-end infinite; }
  .idle-ring      { animation: drift 9s linear infinite; }
  .ticker-track   { animation: ticker 28s linear infinite; }
  .scan-lines     {
    background: repeating-linear-gradient(
      0deg, transparent, transparent 2px,
      rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px
    );
    animation: scanPulse 4s ease-in-out infinite;
  }

  .exec-btn { transition: transform 0.08s ease, box-shadow 0.08s ease; }
  .exec-btn:not(:disabled):hover  { transform: translate(2px,2px);  box-shadow: 2px 2px 0 rgba(255,255,255,0.18) !important; }
  .exec-btn:not(:disabled):active { transform: translate(5px,5px);  box-shadow: none !important; }

  .clr-btn:hover  { border-color: rgba(124,166,230,0.55) !important; color: ${A} !important; }

  .gh-link:hover  { background: rgba(124,166,230,0.14) !important; }

  .prob-row:not(:last-child) { border-bottom: 1px solid rgba(124,166,230,0.07); padding-bottom: 14px; }

  /* Noise grain via SVG data URI */
  .nlp-noise {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.04; mix-blend-mode: screen; pointer-events: none;
  }
`;

/* ─────────────────────────── Component ─────────────────────────────── */
export default function SentimentAnalyzer() {
  const [state, formAction, isPending] = useActionState(analyzeSentiment, null);

  const sStyle = state?.data ? sentimentStyle(state.data.sentiment) : null;
  const topProb = state?.data
    ? Math.round(Math.max(...Object.values(state.data.probabilities)) * 100)
    : 0;

  const statusColor = isPending ? "#FFBB33"
    : state?.data  ? A
    : "#3DDA84";
  const statusLabel = isPending ? "PROCESSING" : state?.data ? "RESULT_READY" : "IDLE";

  return (
    <>
      <style>{CSS}</style>

      {/* ── Root: dark field + grid ─────────────────────────────── */}
      <div
        className="nlp-root min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden"
        style={{
          background: DARK,
          backgroundImage: `
            linear-gradient(rgba(124,166,230,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,166,230,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      >
        {/* Atmospheric bloom */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-15%", left: "20%",
            width: 700, height: 700,
            background: `radial-gradient(circle, rgba(124,166,230,0.07) 0%, transparent 65%)`,
          }}
        />

        {/* Scan-lines overlay */}
        <div className="scan-lines absolute inset-0 pointer-events-none z-0" />

        {/* Noise grain */}
        <div className="nlp-noise absolute inset-0 z-0" />

        {/* Corner meta labels */}
        <div
          className="nlp-mono absolute top-5 left-5 text-[10px] leading-relaxed tracking-widest select-none"
          style={{ color: "rgba(124,166,230,0.28)" }}
        >
          NLP_CORE / v1.0.0<br />MODEL.STATUS: {statusLabel}
        </div>
        <div
          className="nlp-mono absolute bottom-5 right-5 text-[10px] leading-relaxed tracking-widest select-none text-right"
          style={{ color: "rgba(124,166,230,0.28)" }}
        >
          MULTINOMIAL_NB<br />TF-IDF_VECTORIZER
        </div>

        {/* ── Card wrapper (offset shadow) ───────────────────────── */}
        <div className="relative w-full max-w-4xl z-10">

          {/* Brutal offset layer */}
          <div
            className="absolute inset-0"
            style={{
              transform: "translate(7px, 7px)",
              background: A,
              opacity: 0.55,
            }}
          />

          {/* Glass surface */}
          <div
            className="relative overflow-hidden"
            style={{
              background: "rgba(9,11,18,0.84)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: `2px solid rgba(124,166,230,0.32)`,
            }}
          >
            {/* Top color strip */}
            <div
              className="h-[3px] w-full"
              style={{ background: `linear-gradient(90deg, ${A} 0%, rgba(124,166,230,0.15) 100%)` }}
            />

            {/* Ticker tape */}
            <div
              className="overflow-hidden border-b"
              style={{ borderColor: "rgba(124,166,230,0.12)", height: 28 }}
            >
              <div
                className="nlp-mono ticker-track whitespace-nowrap text-[10px] tracking-widest flex gap-12 items-center h-full"
                style={{ color: "rgba(124,166,230,0.35)", width: "200%" }}
              >
                {Array(8).fill(null).map((_, i) => (
                  <span key={i}>
                    NLP_CORE &nbsp;·&nbsp; SENTIMENT_ANALYSIS &nbsp;·&nbsp;
                    NAIVE_BAYES &nbsp;·&nbsp; TF-IDF &nbsp;·&nbsp;
                    TEXT_CLASSIFICATION &nbsp;·&nbsp; v1.0.0 &nbsp;·&nbsp;
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 lg:p-10">

              {/* ── Header ─────────────────────────────────────────── */}
              <header className="mb-8">
                <div className="flex items-start justify-between gap-6">

                  {/* Title block */}
                  <div>
                    <div className="flex items-end gap-4">
                      <h1
                        className="leading-[0.82] font-black tracking-tighter uppercase text-white"
                        style={{ fontSize: "clamp(60px, 10vw, 100px)", letterSpacing: "-2px" }}
                      >
                        Sentiment<br />
                        <span style={{ color: A }}>Analyzer</span>
                      </h1>
                      <div className="flex flex-col gap-2 mb-2">
                        <div
                          className="nlp-mono text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-1 border"
                          style={{
                            color: A,
                            borderColor: `rgba(124,166,230,0.35)`,
                            background: `rgba(124,166,230,0.08)`,
                          }}
                        >
                          v1.0.0
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background: statusColor,
                              boxShadow: `0 0 6px ${statusColor}`,
                            }}
                          />
                          <span
                            className="nlp-mono text-[10px] tracking-widest uppercase"
                            style={{ color: statusColor }}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p
                      className="nlp-mono mt-3 text-[11px] lg:text-xs tracking-widest uppercase"
                      style={{ color: "rgba(124,166,230,0.5)" }}
                    >
                      Naive Bayes &nbsp;·&nbsp; TF-IDF &nbsp;·&nbsp; MultinomialNB
                    </p>
                  </div>

                  {/* Right meta */}
                  <div className="hidden sm:flex flex-col items-end gap-3 shrink-0 pt-1">
                    <a
                      href="https://github.com/tuboa2"
                      target="_blank"
                      rel="noreferrer"
                      className="gh-link nlp-mono text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 border transition-all duration-150"
                      style={{
                        color: A,
                        borderColor: `rgba(124,166,230,0.35)`,
                        background: `rgba(124,166,230,0.06)`,
                      }}
                    >
                      @tuboa2
                    </a>

                    {/* Coordinate decoration */}
                    <div
                      className="nlp-mono text-[9px] tracking-widest text-right"
                      style={{ color: "rgba(124,166,230,0.25)" }}
                    >
                      X: 127.0.0.1<br />PORT: 8000
                    </div>
                  </div>
                </div>

                {/* Divider with diamond marks */}
                <div className="relative mt-6 h-px" style={{ background: "rgba(124,166,230,0.15)" }}>
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                    style={{ background: A }}
                  />
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                    style={{ background: A }}
                  />
                </div>
              </header>

              {/* ── Form ───────────────────────────────────────────── */}
              <form action={formAction} className="space-y-4">

                {/* Textarea */}
                <div className="relative">
                  <div
                    className="nlp-mono text-[10px] tracking-[0.25em] uppercase mb-2"
                    style={{ color: "rgba(124,166,230,0.45)" }}
                  >
                    INPUT_TEXT<span className="cursor-blink">_</span>
                  </div>

                  <textarea
                    name="text"
                    rows={4}
                    className="nlp-ta w-full text-white text-base lg:text-lg p-4 border-2 transition-all duration-150"
                    style={{
                      background: "rgba(124,166,230,0.04)",
                      borderColor: "rgba(124,166,230,0.28)",
                      borderRadius: 0,
                    }}
                    placeholder="// Enter text for sentiment classification..."
                  />

                  {state?.error && (
                    <div
                      className="nlp-mono flex items-center gap-2 mt-2 px-3 py-2 text-xs font-bold uppercase tracking-wider border-l-[3px]"
                      style={{
                        background: "rgba(240,100,100,0.08)",
                        borderColor: "#F06464",
                        color: "#F08080",
                      }}
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                      {state.error}
                    </div>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between gap-4">
                  <div
                    className="nlp-mono text-[10px] tracking-widest uppercase hidden sm:block"
                    style={{ color: "rgba(124,166,230,0.25)" }}
                  >
                    MODEL<span style={{ color: "rgba(124,166,230,0.5)" }}>::</span>MULTINOMIAL_NB
                  </div>

                  <div className="flex gap-3 ml-auto">
                    <button
                      type="reset"
                      className="clr-btn nlp-mono text-xs font-bold tracking-widest uppercase px-5 py-3 border transition-all duration-150"
                      style={{
                        color: "rgba(124,166,230,0.5)",
                        borderColor: "rgba(124,166,230,0.2)",
                        background: "transparent",
                        borderRadius: 0,
                      }}
                    >
                      CLR
                    </button>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="exec-btn flex items-center gap-2.5 font-black text-sm lg:text-base tracking-widest uppercase px-8 py-3 border-2 disabled:opacity-40 disabled:pointer-events-none"
                      style={{
                        background: A,
                        borderColor: A,
                        color: DARK,
                        borderRadius: 0,
                        boxShadow: `5px 5px 0px rgba(124,166,230,0.25)`,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      {isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} /> PROCESSING</>
                      ) : (
                        <><Sparkles className="w-4 h-4" strokeWidth={2.5} /> ANALYZE</>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* ── Results ────────────────────────────────────────── */}
              <div className="mt-8">
                {state?.data ? (
                  <div className="result-appear">

                    {/* Result section label */}
                    <div
                      className="nlp-mono text-[10px] tracking-[0.25em] uppercase flex items-center gap-3 mb-4"
                      style={{ color: "rgba(124,166,230,0.45)" }}
                    >
                      <div className="h-px w-5" style={{ background: "rgba(124,166,230,0.4)" }} />
                      OUTPUT_RESULT
                      <div className="flex-1 h-px" style={{ background: "rgba(124,166,230,0.1)" }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                      {/* ── Verdict panel ─── */}
                      <div
                        className="md:col-span-2 relative overflow-hidden p-6 lg:p-8 flex flex-col justify-between border-2"
                        style={{
                          borderColor: sStyle!.accent,
                          background: `${sStyle!.accent}12`,
                          minHeight: 180,
                        }}
                      >
                        {/* Giant watermark letter */}
                        <div
                          className="absolute -bottom-2 -right-2 font-black leading-none uppercase select-none pointer-events-none"
                          style={{
                            fontSize: 140,
                            color: `${sStyle!.accent}10`,
                            fontFamily: "'Barlow Condensed', sans-serif",
                            lineHeight: 1,
                          }}
                        >
                          {state.data.sentiment.charAt(0)}
                        </div>

                        {/* Corner brackets */}
                        <div
                          className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2"
                          style={{ borderColor: sStyle!.accent, opacity: 0.45 }}
                        />
                        <div
                          className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2"
                          style={{ borderColor: sStyle!.accent, opacity: 0.45 }}
                        />

                        <div
                          className="nlp-mono text-[10px] tracking-widest uppercase"
                          style={{ color: "rgba(124,166,230,0.45)" }}
                        >
                          POLARITY_CLASS
                        </div>

                        <div className="mt-4">
                          <div
                            className="font-black tracking-tight uppercase leading-none"
                            style={{
                              fontSize: "clamp(40px, 8vw, 68px)",
                              color: sStyle!.accent,
                              fontFamily: "'Barlow Condensed', sans-serif",
                            }}
                          >
                            {state.data.sentiment}
                          </div>
                          <div
                            className="nlp-mono text-[10px] mt-3 uppercase tracking-widest flex items-center gap-2"
                            style={{ color: "rgba(124,166,230,0.45)" }}
                          >
                            <span>CONFIDENCE</span>
                            <span
                              className="px-1.5 py-0.5 border font-bold"
                              style={{ borderColor: `rgba(124,166,230,0.3)`, color: A }}
                            >
                              {topProb}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ── Probabilities panel ─── */}
                      <div
                        className="md:col-span-3 p-6 lg:p-8 border"
                        style={{
                          borderColor: "rgba(124,166,230,0.18)",
                          background: "rgba(124,166,230,0.025)",
                        }}
                      >
                        <div
                          className="nlp-mono text-[10px] tracking-widest uppercase mb-5"
                          style={{ color: "rgba(124,166,230,0.45)" }}
                        >
                          CLASS_DISTRIBUTION_MASS
                        </div>

                        <div className="space-y-4">
                          {Object.entries(state.data.probabilities)
                            .sort(([, a], [, b]) => b - a)
                            .map(([cls, prob], i) => {
                              const pct = Math.round(prob * 100);
                              const isTop = i === 0;
                              return (
                                <div key={cls} className="prob-row">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                      {isTop && (
                                        <span
                                          className="nlp-mono text-[9px] font-bold tracking-widest px-1.5 py-0.5 border"
                                          style={{
                                            color: DARK,
                                            background: A,
                                            borderColor: A,
                                          }}
                                        >
                                          TOP
                                        </span>
                                      )}
                                      <span
                                        className="nlp-mono text-xs lg:text-sm font-bold uppercase tracking-wider"
                                        style={{ color: isTop ? "white" : "rgba(255,255,255,0.45)" }}
                                      >
                                        {cls}
                                      </span>
                                    </div>
                                    <span
                                      className="nlp-mono text-sm lg:text-base font-bold"
                                      style={{ color: isTop ? A : "rgba(255,255,255,0.35)" }}
                                    >
                                      {pct}%
                                    </span>
                                  </div>

                                  {/* Track */}
                                  <div
                                    className="relative h-[7px] w-full overflow-hidden"
                                    style={{
                                      background: "rgba(124,166,230,0.07)",
                                      border: "1px solid rgba(124,166,230,0.12)",
                                    }}
                                  >
                                    <div
                                      className="bar-fill absolute top-0 left-0 h-full"
                                      style={{
                                        width: `${pct}%`,
                                        background: isTop
                                          ? A
                                          : "rgba(124,166,230,0.3)",
                                        animationDelay: `${i * 0.12}s`,
                                      }}
                                    />
                                    {/* Notch markers */}
                                    {[25, 50, 75].map((mark) => (
                                      <div
                                        key={mark}
                                        className="absolute top-0 h-full w-px"
                                        style={{
                                          left: `${mark}%`,
                                          background: "rgba(124,166,230,0.15)",
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── Idle state ─── */
                  <div
                    className="flex items-center justify-between px-6 py-5 border"
                    style={{
                      borderColor: "rgba(124,166,230,0.1)",
                      background: "rgba(124,166,230,0.02)",
                    }}
                  >
                    <div
                      className="nlp-mono text-sm tracking-widest uppercase"
                      style={{ color: "rgba(124,166,230,0.3)" }}
                    >
                      AWAITING_INPUT<span className="cursor-blink">_</span>
                    </div>
                    <svg
                      className="idle-ring"
                      width={28}
                      height={28}
                      viewBox="0 0 28 28"
                      fill="none"
                      style={{ opacity: 0.35 }}
                    >
                      <circle cx={14} cy={14} r={12} stroke={A} strokeWidth={1.5} strokeDasharray="4 3" />
                      <circle cx={14} cy={14} r={4} fill={A} opacity={0.4} />
                    </svg>
                  </div>
                )}
              </div>

            </div>{/* /inner pad */}

            {/* Bottom strip */}
            <div
              className="px-6 lg:px-10 py-2.5 flex items-center justify-between border-t"
              style={{ borderColor: "rgba(124,166,230,0.1)" }}
            >
              <div
                className="nlp-mono text-[9px] tracking-widest uppercase"
                style={{ color: "rgba(124,166,230,0.25)" }}
              >
                NLP_CORE · 2025 · tuboa2
              </div>
              <a
                href="https://github.com/tuboa2"
                target="_blank"
                rel="noreferrer"
                className="sm:hidden nlp-mono text-[9px] font-bold tracking-widest uppercase"
                style={{ color: A }}
              >
                @tuboa2
              </a>
              <div
                className="nlp-mono text-[9px] tracking-widest uppercase"
                style={{ color: "rgba(124,166,230,0.25)" }}
              >
                LOCALHOST:8000
              </div>
            </div>
          </div>{/* /glass surface */}
        </div>{/* /card wrapper */}
      </div>{/* /root */}
    </>
  );
}
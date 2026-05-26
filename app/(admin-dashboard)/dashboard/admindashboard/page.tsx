"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, ArrowLeft } from "lucide-react";

// ─── Model definitions ──────────────────────────────────────────────────────

type ModelKey =
  | "conversation"
  | "codeGeneration"
  | "imageGeneration"
  | "imageRestore"
  | "imageBackgroundRemoval"
  | "imageGenerativeFill"
  | "imageObjectRecolor"
  | "imageObjectRemove"
  | "videoGeneration"
  | "musicGeneration"
  | "speechGeneration";

type ModelGroup = "text" | "image" | "video" | "audio";

interface ModelDef {
  name: string;
  tokens: number;
  group: ModelGroup;
}

const MODELS: Record<ModelKey, ModelDef> = {
  conversation:           { name: "Chat Assistant",        tokens: 1,  group: "text"  },
  codeGeneration:         { name: "Code Generation",       tokens: 5,  group: "text"  },
  imageGeneration:        { name: "Image Generation",      tokens: 14, group: "image" },
  imageRestore:           { name: "Image Restore",         tokens: 11, group: "image" },
  imageBackgroundRemoval: { name: "Background Removal",    tokens: 17, group: "image" },
  imageGenerativeFill:    { name: "Generative Fill",       tokens: 20, group: "image" },
  imageObjectRecolor:     { name: "Object Recolor",        tokens: 16, group: "image" },
  imageObjectRemove:      { name: "Object Remove",         tokens: 28, group: "image" },
  videoGeneration:        { name: "Video Generation",      tokens: 20, group: "video" },
  musicGeneration:        { name: "Music Generation",      tokens: 11, group: "audio" },
  speechGeneration:       { name: "Speech Generation",     tokens: 13, group: "audio" },
};

const MODEL_GROUPS: Record<ModelGroup, ModelKey[]> = {
  text:  ["conversation", "codeGeneration"],
  image: ["imageGeneration", "imageRestore", "imageBackgroundRemoval", "imageGenerativeFill", "imageObjectRecolor", "imageObjectRemove"],
  video: ["videoGeneration"],
  audio: ["musicGeneration", "speechGeneration"],
};

const ALL_GROUPS: ModelGroup[] = ["text", "image", "video", "audio"];

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActivityRow {
  date: string;
  time: string;
  model: string;
  tokensUsed: number;
  tokensTotal: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const rand = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = <T,>(arr: T[]): T => arr[rand(0, arr.length - 1)];

const parseDate = (dateStr: string): Date | null => {
  const parts = dateStr.split(".");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000) return null;
  return new Date(year, month - 1, day);
};

const formatDate = (d: Date): string => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const formatTime = (d: Date): string => {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

// ─── Activity generator ───────────────────────────────────────────────────────

const generateActivity = (
  tokensTarget: number,
  startDate: Date,
  endDate: Date
): ActivityRow[] => {
  const rows: ActivityRow[] = [];
  let remainingTokens = tokensTarget;
  let totalSpent = 0;

  const startMs = startDate.getTime();
  // Set end to end of day
  const endMs = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59).getTime();

  if (startMs > endMs) return [];

  let cursorMs = startMs + rand(0, 3) * 3600_000; // slight offset into first day

  while (remainingTokens > 0 && cursorMs <= endMs) {
    // Pick a model group for this session
    const group = pickRandom(ALL_GROUPS);
    const groupModels = MODEL_GROUPS[group];

    // Pick 1-3 distinct models for this session
    const sessionModelCount = Math.min(rand(1, 3), groupModels.length);
    const shuffled = [...groupModels].sort(() => Math.random() - 0.5);
    const sessionModels = shuffled.slice(0, sessionModelCount);

    // Each model gets used 1-4 times in this session
    for (const modelKey of sessionModels) {
      if (remainingTokens <= 0 || cursorMs > endMs) break;

      const uses = rand(1, 4);
      for (let i = 0; i < uses; i++) {
        if (remainingTokens <= 0 || cursorMs > endMs) break;

        const model = MODELS[modelKey];
        const cost = Math.min(model.tokens, remainingTokens);

        rows.push({
          date: formatDate(new Date(cursorMs)),
          time: formatTime(new Date(cursorMs)),
          model: model.name,
          tokensUsed: cost,
          tokensTotal: totalSpent + cost,
        });

        totalSpent += cost;
        remainingTokens -= cost;

        // Gap between individual uses: 2-25 min
        cursorMs += rand(2, 25) * 60_000;
      }

      // Gap between models within session: 5-40 min
      cursorMs += rand(5, 40) * 60_000;
    }

    // Gap between sessions: 4-72 hours
    cursorMs += rand(4, 72) * 3600_000;
  }

  return rows;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [email, setEmail] = useState("");
  const [tokensSpend, setTokensSpend] = useState("1500");
  const [firstDate, setFirstDate] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [rowsCount, setRowsCount] = useState("10");

  const [activityRows, setActivityRows] = useState<ActivityRow[]>([]);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  const isEmailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isDateValid = (v: string) => parseDate(v) !== null;

  const canGenerate =
    isEmailValid(email) &&
    Number(tokensSpend) > 0 &&
    isDateValid(firstDate) &&
    isDateValid(lastDate);

  const handleGenerateActivity = () => {
    setError("");
    setGenerated(false);

    const start = parseDate(firstDate);
    const end = parseDate(lastDate);
    const tokens = parseInt(tokensSpend, 10);

    if (!start || !end) {
      setError("Invalid date format. Use DD.MM.YYYY");
      return;
    }
    if (start > end) {
      setError("First date must be before last date");
      return;
    }
    if (tokens <= 0) {
      setError("Tokens spend must be greater than 0");
      return;
    }

    const rows = generateActivity(tokens, start, end);
    setActivityRows(rows);
    setGenerated(true);
  };

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        background: "linear-gradient(135deg, #1a0520 0%, #2a0f35 40%, #1e0b2e 70%, #150820 100%)",
        fontFamily: '"Space Grotesk", Inter, system-ui, sans-serif',
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, #e040fb 0%, #7b1fa2 50%, transparent 100%)" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle, #f06292 0%, transparent 70%)" }}
        />
      </div>

      {/* Page content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ background: "rgba(224,64,251,0.2)", border: "1px solid rgba(224,64,251,0.3)" }}
            >
              <SlidersHorizontal className="w-5 h-5 text-fuchsia-300" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-white"
                style={{ fontFamily: '"Space Grotesk", Inter, sans-serif', letterSpacing: "0.01em" }}
              >
                Account Overview
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                View account activity, usage history, and transaction records for the selected user.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.75)" }}
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* Activity configuration */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h2 className="text-base font-semibold text-white mb-5">Activity configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Email */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Email
              </label>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(224,64,251,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                aria-label="User email"
              />
            </div>

            {/* Tokens spend */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Tokens spend
              </label>
              <input
                type="number"
                min={1}
                placeholder="1500"
                value={tokensSpend}
                onChange={(e) => setTokensSpend(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(224,64,251,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                aria-label="Tokens to spend"
              />
            </div>

            {/* First date */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                First date
              </label>
              <input
                type="text"
                placeholder="DD.MM.YYYY"
                value={firstDate}
                onChange={(e) => setFirstDate(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(224,64,251,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                maxLength={10}
                aria-label="Start date DD.MM.YYYY"
              />
            </div>

            {/* Last date */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Last date
              </label>
              <input
                type="text"
                placeholder="DD.MM.YYYY"
                value={lastDate}
                onChange={(e) => setLastDate(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(224,64,251,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                maxLength={10}
                aria-label="End date DD.MM.YYYY"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs mb-3" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleGenerateActivity}
            disabled={!canGenerate}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
            style={{
              background: canGenerate
                ? "linear-gradient(135deg, #e91e8c 0%, #f06292 100%)"
                : "rgba(255,255,255,0.1)",
              cursor: canGenerate ? "pointer" : "not-allowed",
              opacity: canGenerate ? 1 : 0.5,
            }}
            aria-label="Generate activity"
            aria-disabled={!canGenerate}
          >
            Generate activity
          </button>
        </div>

        {/* Payment configuration */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h2 className="text-base font-semibold text-white mb-5">Payment configuration</h2>

          <div className="flex items-end gap-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Rows count
              </label>
              <input
                type="number"
                min={1}
                placeholder="10"
                value={rowsCount}
                onChange={(e) => setRowsCount(e.target.value)}
                className="w-28 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(224,64,251,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                aria-label="Payment rows count"
              />
            </div>

            <button
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #e91e8c 0%, #f06292 100%)",
                cursor: "pointer",
              }}
              aria-label="Generate payment rows"
            >
              Generate rows
            </button>
          </div>
        </div>

        {/* Generated activity table */}
        {generated && activityRows.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <h2 className="text-base font-semibold text-white">
                Generated activity
                <span
                  className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(224,64,251,0.2)", color: "#f0abfc" }}
                >
                  {activityRows.length} rows · {email}
                </span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["#", "Date", "Time", "Model / Tool", "Tokens", "Total spent"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activityRows.map((row, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{row.date}</td>
                      <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {row.time}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "rgba(224,64,251,0.15)", color: "#f0abfc" }}
                        >
                          {row.model}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">{row.tokensUsed}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#f0abfc" }}>
                        {row.tokensTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {generated && activityRows.length === 0 && (
          <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            No activity could be generated for the given parameters. Try a wider date range or more tokens.
          </p>
        )}
      </div>
    </div>
  );
}

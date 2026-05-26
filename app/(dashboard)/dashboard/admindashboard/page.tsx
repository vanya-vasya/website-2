"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputStyles, buttonStyles, contentStyles } from "@/components/ui/feature-styles";

// ─── Model definitions ───────────────────────────────────────────────────────

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
  conversation:           { name: "Chat Assistant",     tokens: 1,  group: "text"  },
  codeGeneration:         { name: "Code Generation",    tokens: 5,  group: "text"  },
  imageGeneration:        { name: "Image Generation",   tokens: 14, group: "image" },
  imageRestore:           { name: "Image Restore",      tokens: 11, group: "image" },
  imageBackgroundRemoval: { name: "Background Removal", tokens: 17, group: "image" },
  imageGenerativeFill:    { name: "Generative Fill",    tokens: 20, group: "image" },
  imageObjectRecolor:     { name: "Object Recolor",     tokens: 16, group: "image" },
  imageObjectRemove:      { name: "Object Remove",      tokens: 28, group: "image" },
  videoGeneration:        { name: "Video Generation",   tokens: 20, group: "video" },
  musicGeneration:        { name: "Music Generation",   tokens: 11, group: "audio" },
  speechGeneration:       { name: "Speech Generation",  tokens: 13, group: "audio" },
};

const MODEL_GROUPS: Record<ModelGroup, ModelKey[]> = {
  text:  ["conversation", "codeGeneration"],
  image: ["imageGeneration", "imageRestore", "imageBackgroundRemoval", "imageGenerativeFill", "imageObjectRecolor", "imageObjectRemove"],
  video: ["videoGeneration"],
  audio: ["musicGeneration", "speechGeneration"],
};

const ALL_GROUPS: ModelGroup[] = ["text", "image", "video", "audio"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityRow {
  date: string;
  time: string;
  model: string;
  tokensUsed: number;
  tokensTotal: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const endMs = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    23, 59, 59
  ).getTime();

  if (startMs > endMs) return [];

  let cursorMs = startMs + rand(0, 3) * 3_600_000;

  while (remainingTokens > 0 && cursorMs <= endMs) {
    const group = pickRandom(ALL_GROUPS);
    const groupModels = MODEL_GROUPS[group];
    const sessionModelCount = Math.min(rand(1, 3), groupModels.length);
    const sessionModels = [...groupModels]
      .sort(() => Math.random() - 0.5)
      .slice(0, sessionModelCount);

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
        cursorMs += rand(2, 25) * 60_000;
      }

      cursorMs += rand(5, 40) * 60_000;
    }

    cursorMs += rand(4, 72) * 3_600_000;
  }

  return rows;
};

// ─── Component ────────────────────────────────────────────────────────────────

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

  const canGenerate =
    isEmailValid(email) &&
    Number(tokensSpend) > 0 &&
    parseDate(firstDate) !== null &&
    parseDate(lastDate) !== null;

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
      setError("First date must be before last date.");
      return;
    }
    if (tokens <= 0) {
      setError("Tokens spend must be greater than 0.");
      return;
    }

    setActivityRows(generateActivity(tokens, start, end));
    setGenerated(true);
  };

  return (
    <div className="bg-white space-y-8">
      {/* ── Page header ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 justify-center">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-20 blur-lg" />
            <div className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 p-3 rounded-full">
              <SlidersHorizontal className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"
            style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}
          >
            Account Overview
          </h1>
        </div>
        <p className="text-center text-muted-foreground max-w-[700px] mx-auto">
          View account activity, usage history, and transaction records for the selected user.
        </p>
        <div className="flex justify-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-black transition-colors"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>

      {/* ── Activity configuration ── */}
      <div className={contentStyles.base}>
        <div
          className="rounded-xl border border-gray-200 bg-white shadow-sm p-6"
          style={{ boxShadow: "0 0 0 1px rgba(129,140,248,0.15), 0 4px 6px -1px rgba(0,0,0,0.05)" }}
        >
          <h2
            className="text-base font-semibold text-black mb-5"
            style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}
          >
            Activity configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <div className={cn(inputStyles.container, "p-0")}>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(inputStyles.base, "w-full px-3 py-2.5 text-sm")}
                  aria-label="User email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Tokens spend</label>
              <div className={cn(inputStyles.container, "p-0")}>
                <input
                  type="number"
                  min={1}
                  placeholder="1500"
                  value={tokensSpend}
                  onChange={(e) => setTokensSpend(e.target.value)}
                  className={cn(inputStyles.base, "w-full px-3 py-2.5 text-sm")}
                  aria-label="Tokens to spend"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">First date</label>
              <div className={cn(inputStyles.container, "p-0")}>
                <input
                  type="text"
                  placeholder="DD.MM.YYYY"
                  value={firstDate}
                  onChange={(e) => setFirstDate(e.target.value)}
                  maxLength={10}
                  className={cn(inputStyles.base, "w-full px-3 py-2.5 text-sm")}
                  aria-label="Start date DD.MM.YYYY"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Last date</label>
              <div className={cn(inputStyles.container, "p-0")}>
                <input
                  type="text"
                  placeholder="DD.MM.YYYY"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                  maxLength={10}
                  className={cn(inputStyles.base, "w-full px-3 py-2.5 text-sm")}
                  aria-label="End date DD.MM.YYYY"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 mb-3">{error}</p>
          )}

          <button
            onClick={handleGenerateActivity}
            disabled={!canGenerate}
            aria-disabled={!canGenerate}
            aria-label="Generate activity"
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200",
              canGenerate
                ? buttonStyles.base
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            Generate activity
          </button>
        </div>
      </div>

      {/* ── Payment configuration ── */}
      <div className={contentStyles.base}>
        <div
          className="rounded-xl border border-gray-200 bg-white shadow-sm p-6"
          style={{ boxShadow: "0 0 0 1px rgba(129,140,248,0.15), 0 4px 6px -1px rgba(0,0,0,0.05)" }}
        >
          <h2
            className="text-base font-semibold text-black mb-5"
            style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}
          >
            Payment configuration
          </h2>

          <div className="flex items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Rows count</label>
              <div className={cn(inputStyles.container, "p-0 w-32")}>
                <input
                  type="number"
                  min={1}
                  placeholder="10"
                  value={rowsCount}
                  onChange={(e) => setRowsCount(e.target.value)}
                  className={cn(inputStyles.base, "w-full px-3 py-2.5 text-sm")}
                  aria-label="Payment rows count"
                />
              </div>
            </div>

            <button
              aria-label="Generate payment rows"
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200",
                buttonStyles.base
              )}
            >
              Generate rows
            </button>
          </div>
        </div>
      </div>

      {/* ── Generated activity table ── */}
      {generated && activityRows.length > 0 && (
        <div className={contentStyles.base}>
          <div
            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            style={{ boxShadow: "0 0 0 1px rgba(129,140,248,0.15), 0 4px 6px -1px rgba(0,0,0,0.05)" }}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <h2
                className="text-base font-semibold text-black"
                style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}
              >
                Generated activity
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                {activityRows.length} rows · {email}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["#", "Date", "Time", "Model / Tool", "Tokens", "Total spent"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activityRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-black">{row.date}</td>
                      <td className="px-4 py-3 text-gray-500">{row.time}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {row.model}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-black">{row.tokensUsed}</td>
                      <td className="px-4 py-3 font-semibold text-indigo-600">{row.tokensTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {generated && activityRows.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No activity could be generated. Try a wider date range or more tokens.
        </p>
      )}
    </div>
  );
}

import { useCallback, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MOODS, THEMES, PASSAGE_LENGTH_MINUTES } from "../lib/constants.js";
import { generatePassage } from "../lib/api.js";
import {
  addReadDate,
  clearSession,
  loadSession,
  loadFavourites,
  saveFavourites,
  saveSession,
} from "../lib/storage.js";
import { todayKey } from "../lib/dates.js";

function readInitialFromSession() {
  const s = loadSession();
  const dk = todayKey();
  if (s?.dateKey !== dk || !s?.passage) {
    return {
      passage: null,
      completedToday: false,
      mood: "focused",
      themeMode: "surprise",
      themePick: THEMES[0],
    };
  }
  return {
    passage: s.passage,
    completedToday: !!s.completedToday,
    mood: s.mood || "focused",
    themeMode: s.themeMode || "surprise",
    themePick: s.themePick && THEMES.includes(s.themePick) ? s.themePick : THEMES[0],
  };
}

export default function Home() {
  const { profile, refreshReads } = useOutletContext();
  const init = useMemo(() => readInitialFromSession(), []);
  const [mood, setMood] = useState(init.mood);
  const [themeMode, setThemeMode] = useState(init.themeMode);
  const [themePick, setThemePick] = useState(init.themePick);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passage, setPassage] = useState(init.passage);
  const [completedToday, setCompletedToday] = useState(init.completedToday);
  const [savedToast, setSavedToast] = useState(false);

  const dateKey = todayKey();
  const checkinFirst = profile.readingStyle === "checkin";
  const targetReadMinutes = PASSAGE_LENGTH_MINUTES[profile.passageLength] ?? 4;

  const moodLabel = useMemo(() => MOODS.find((m) => m.id === mood)?.label || mood, [mood]);

  const persistSession = useCallback(
    (next) => {
      saveSession({
        dateKey,
        mood,
        themeMode,
        themePick,
        ...next,
      });
    },
    [dateKey, mood, themeMode, themePick]
  );

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setCompletedToday(false);
    try {
      const surprise = checkinFirst ? themeMode === "surprise" : true;
      const body = {
        name: profile.name,
        role: profile.jobTitle,
        industry: profile.industry,
        goals: profile.careerGoal,
        topics: profile.focusAreas,
        mood: checkinFirst ? moodLabel : "Ready to read — straight to the passage",
        theme: surprise ? undefined : themePick,
        surprise,
        targetReadMinutes,
      };
      const data = await generatePassage(body);
      setPassage(data);
      persistSession({ passage: data, completedToday: false });
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = () => {
    addReadDate(dateKey);
    refreshReads();
    setCompletedToday(true);
    persistSession({ passage, completedToday: true });
  };

  const handleSaveFavourite = () => {
    if (!passage) return;
    const list = loadFavourites();
    const id = crypto.randomUUID();
    saveFavourites([
      {
        id,
        title: passage.title,
        sourceLabel: passage.sourceLabel,
        passageText: passage.passageText,
        focusTip: passage.focusTip,
        readTimeMinutes: passage.readTimeMinutes,
        theme: passage.theme,
        savedAt: new Date().toISOString(),
      },
      ...list,
    ]);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2200);
  };

  const handleNewPassage = () => {
    setPassage(null);
    setCompletedToday(false);
    setError("");
    setMood("focused");
    setThemeMode("surprise");
    setThemePick(THEMES[0]);
    clearSession();
  };

  const firstName = profile.name.split(" ")[0];

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-inkMuted">Today</p>
        <h1 className="font-serif text-3xl text-ink leading-tight">Hello, {firstName}</h1>
        <p className="font-sans text-inkMuted leading-relaxed">
          {checkinFirst
            ? "Check in, then open a passage written for your voice — and read it like you mean it."
            : "When you’re ready, we’ll open something tailored to you — no detours, just the page."}
        </p>
      </section>

      {!passage ? (
        <section className="rounded-2xl border border-border bg-white/50 p-6 shadow-soft space-y-8">
          {checkinFirst ? (
            <>
              <div>
                <h2 className="font-sans text-sm font-semibold text-ink mb-3">How&apos;s your energy?</h2>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      data-active={mood === m.id}
                      className="chip"
                      onClick={() => setMood(m.id)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-inkMuted">{MOODS.find((x) => x.id === mood)?.hint}</p>
              </div>

              <div>
                <h2 className="font-sans text-sm font-semibold text-ink mb-3">Theme</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    data-active={themeMode === "surprise"}
                    className="chip"
                    onClick={() => setThemeMode("surprise")}
                  >
                    Surprise me
                  </button>
                  <button
                    type="button"
                    data-active={themeMode === "pick"}
                    className="chip"
                    onClick={() => setThemeMode("pick")}
                  >
                    Pick a theme
                  </button>
                </div>
                {themeMode === "pick" ? (
                  <label className="block">
                    <span className="sr-only">Theme</span>
                    <select
                      className="input"
                      value={themePick}
                      onChange={(e) => setThemePick(e.target.value)}
                    >
                      {THEMES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            </>
          ) : (
            <p className="font-serif text-lg text-ink leading-relaxed">
              Your passage is tuned for{" "}
              <span className="text-accent font-medium">~{targetReadMinutes} minutes</span> at the microphone — same
              profile you set up, no extra steps.
            </p>
          )}

          {error ? (
            <p className="text-sm text-accent" role="alert">
              {error}
            </p>
          ) : null}

          <button type="button" className="btn-primary w-full" onClick={handleGenerate} disabled={loading}>
            {loading
              ? "Drafting your passage…"
              : checkinFirst
                ? "Generate today’s passage"
                : "Bring today’s passage"}
          </button>
        </section>
      ) : (
        <PassageView
          passage={passage}
          completedToday={completedToday}
          onMarkRead={handleMarkRead}
          onSave={handleSaveFavourite}
          onNew={handleNewPassage}
          savedToast={savedToast}
          newPassageLabel={checkinFirst ? "New check-in & passage" : "New passage"}
        />
      )}
    </div>
  );
}

function PassageView({ passage, completedToday, onMarkRead, onSave, onNew, savedToast, newPassageLabel }) {
  const paragraphs = passage.passageText.split(/\n\n+/).filter(Boolean);

  return (
    <article className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-accent">{passage.theme}</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-ink leading-snug">{passage.title}</h2>
          <p className="font-sans text-sm text-inkMuted">{passage.sourceLabel}</p>
        </div>
        <p className="shrink-0 rounded-full border border-border bg-white/70 px-3 py-1 font-sans text-xs text-inkMuted">
          ~{passage.readTimeMinutes} min read-aloud
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white/60 p-6 sm:p-8 shadow-soft">
        <div className="font-serif text-lg sm:text-[1.125rem] leading-[1.75] text-ink space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <aside className="rounded-xl border-l-4 border-accent bg-accentSoft/50 px-4 py-3">
        <p className="font-sans text-xs font-semibold uppercase tracking-wider text-accent mb-1">Today’s focus</p>
        <p className="font-serif text-base text-ink leading-relaxed">{passage.focusTip}</p>
      </aside>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={onMarkRead}
          disabled={completedToday}
        >
          {completedToday ? "Logged for today" : "Mark as read"}
        </button>
        <button type="button" className="btn-secondary flex-1" onClick={onSave}>
          Save to favourites
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onNew}
          className="font-sans text-sm text-inkMuted hover:text-accent underline-offset-4 hover:underline"
        >
          {newPassageLabel}
        </button>
        {savedToast ? <span className="text-sm text-inkMuted">Saved to Library.</span> : <span />}
      </div>
    </article>
  );
}

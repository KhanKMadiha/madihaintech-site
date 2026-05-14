import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { MOODS, THEMES, PASSAGE_LENGTH_MINUTES } from "../lib/constants.js";
import { generatePassage } from "../lib/api.js";
import { clearSession, loadSession, saveSession } from "../lib/storage.js";
import { todayKey } from "../lib/dates.js";
import { requestAndSubscribe } from "../lib/notifications.js";

function readInitialFromSession() {
  const s = loadSession();
  const dk = todayKey();
  if (s?.dateKey !== dk || !s?.passage) {
    return { mood: "focused", themeMode: "surprise", themePick: THEMES[0] };
  }
  return {
    mood: s.mood || "focused",
    themeMode: s.themeMode || "surprise",
    themePick: s.themePick && THEMES.includes(s.themePick) ? s.themePick : THEMES[0],
    hasPassage: true,
  };
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper gap-8 px-8">
      <div className="text-center space-y-2">
        <p className="font-serif text-2xl text-ink">Writing your passage…</p>
        <p className="font-sans text-sm text-inkMuted">Tailored to your voice and goals</p>
      </div>
      <div className="w-64 h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full"
          style={{ animation: "loading-bar 2.8s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const { profile } = useOutletContext();
  const navigate = useNavigate();
  const init = useMemo(() => readInitialFromSession(), []);

  const [mood, setMood] = useState(init.mood);
  const [themeMode, setThemeMode] = useState(init.themeMode);
  const [themePick, setThemePick] = useState(init.themePick);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Today's inspiration pick — defaults to all saved inspirations selected
  const allInspirations = profile.speakingInspirations || [];
  const [selectedInspirations, setSelectedInspirations] = useState(allInspirations);
  const toggleInspiration = (name) =>
    setSelectedInspirations((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );

  // Reminder state
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderStatus, setReminderStatus] = useState("idle"); // idle | loading | on | error
  const [reminderError, setReminderError] = useState("");
  const notificationsSupported = "Notification" in window && "serviceWorker" in navigator;
  const reminderAlreadyGranted = notificationsSupported && Notification.permission === "granted";

  const dateKey = todayKey();
  const checkinFirst = profile.readingStyle === "checkin";
  const targetReadMinutes = PASSAGE_LENGTH_MINUTES[profile.passageLength] ?? 4;
  const moodLabel = useMemo(() => MOODS.find((m) => m.id === mood)?.label || mood, [mood]);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    try {
      const surprise = checkinFirst ? themeMode === "surprise" : true;
      const data = await generatePassage({
        name: profile.name,
        role: profile.jobTitle,
        industry: profile.industry,
        goals: profile.careerGoal,
        topics: profile.focusAreas,
        inspirations: selectedInspirations.length > 0 ? selectedInspirations : profile.speakingInspirations,
        mood: checkinFirst ? moodLabel : "Ready to read — straight to the passage",
        theme: surprise ? undefined : themePick,
        surprise,
        targetReadMinutes,
      });
      saveSession({ dateKey, mood, themeMode, themePick, passage: data, completedToday: false });
      navigate("/read");
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setLoading(false);
    }
  };

  const handleSetReminder = async () => {
    setReminderStatus("loading");
    setReminderError("");
    try {
      await requestAndSubscribe(reminderTime);
      setReminderStatus("on");
    } catch (e) {
      setReminderError(e.message);
      setReminderStatus("error");
    }
  };

  if (loading) return <LoadingScreen />;

  const firstName = profile.name.split(" ")[0];

  return (
    <div className="flex-1 flex flex-col animate-fade-up">
      <div className="flex-1 flex flex-col surface p-6 sm:p-8 gap-6">

        {/* Greeting */}
        <div className="space-y-0.5">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-inkFaint">{today}</p>
          <h1 className="font-serif text-3xl text-ink leading-tight">Hello, {firstName}</h1>
          <p className="font-sans text-sm text-inkMuted leading-relaxed pt-0.5">
            {checkinFirst
              ? "A quick check-in, then today's passage."
              : `Ready when you are — ~${targetReadMinutes} min passage, tailored to you.`}
          </p>
          {allInspirations.length > 0 && (
            <div className="pt-2 space-y-1.5">
              <p className="font-sans text-xs text-inkFaint">Channel today:</p>
              <div className="flex flex-wrap gap-2">
                {allInspirations.map((name) => (
                  <button
                    key={name}
                    type="button"
                    data-active={selectedInspirations.includes(name)}
                    className="chip text-xs py-1 px-3"
                    onClick={() => toggleInspiration(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Form area */}
        <div className="flex-1 flex flex-col gap-5">
          {checkinFirst ? (
            <>
              {/* Mood */}
              <div className="space-y-3">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-inkMuted">
                  How's your energy?
                </p>
                <div className="flex rounded-xl border border-border bg-white/50 p-1 gap-1 overflow-x-auto">
                  {MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`flex-1 min-w-0 rounded-lg py-2 px-2 text-center transition font-sans text-sm whitespace-nowrap ${
                        mood === m.id
                          ? "bg-white text-ink shadow-sm font-semibold"
                          : "text-inkMuted hover:text-ink"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                {MOODS.find((x) => x.id === mood)?.hint && (
                  <p className="text-xs text-inkFaint">{MOODS.find((x) => x.id === mood).hint}</p>
                )}
              </div>

              {/* Theme */}
              <div className="space-y-3">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-inkMuted">
                  Theme
                </p>
                <div className="flex rounded-xl border border-border bg-white/50 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setThemeMode("surprise")}
                    className={`flex-1 rounded-lg py-2 px-3 text-center transition font-sans text-sm ${
                      themeMode === "surprise"
                        ? "bg-white text-ink shadow-sm font-semibold"
                        : "text-inkMuted hover:text-ink"
                    }`}
                  >
                    Surprise me
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode("pick")}
                    className={`flex-1 rounded-lg py-2 px-3 text-center transition font-sans text-sm ${
                      themeMode === "pick"
                        ? "bg-white text-ink shadow-sm font-semibold"
                        : "text-inkMuted hover:text-ink"
                    }`}
                  >
                    Pick a theme
                  </button>
                </div>
                {themeMode === "pick" && (
                  <select
                    className="input text-sm"
                    value={themePick}
                    onChange={(e) => setThemePick(e.target.value)}
                  >
                    {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* Reminder prompt — shown if notifications not yet set up */}
        {notificationsSupported && !reminderAlreadyGranted && reminderStatus !== "on" && (
          <div className="rounded-2xl border border-border bg-white/50 px-4 py-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-sans text-sm font-semibold text-ink">Daily reminder</p>
                <p className="font-sans text-xs text-inkMuted">Get a nudge at the same time every day.</p>
              </div>
              <input
                type="time"
                className="input text-sm w-28 shrink-0 py-2"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
            {reminderError && <p className="font-sans text-xs text-accent">{reminderError}</p>}
            <button
              type="button"
              onClick={handleSetReminder}
              disabled={reminderStatus === "loading"}
              className="btn-secondary w-full py-2.5 text-sm"
            >
              {reminderStatus === "loading" ? "Setting up…" : "Set reminder"}
            </button>
          </div>
        )}

        {reminderStatus === "on" && (
          <p className="font-sans text-xs text-inkMuted text-center">
            Reminder set for {reminderTime} every day ✓
          </p>
        )}

        {/* Error */}
        {error && <p className="text-sm text-accent" role="alert">{error}</p>}

        {/* CTA */}
        <div className="space-y-3 pt-2">
          <button type="button" className="btn-primary w-full py-4 text-base" onClick={handleGenerate}>
            {checkinFirst ? "Generate today's passage" : "Open today's passage"}
          </button>

          {init.hasPassage && (
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => navigate("/read")}
                className="font-sans text-sm text-inkMuted hover:text-accent transition-colors"
              >
                Continue today's passage →
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSession();
                  setMood("focused");
                  setThemeMode("surprise");
                  setThemePick(THEMES[0]);
                  setError("");
                }}
                className="font-sans text-sm text-inkFaint hover:text-inkMuted transition-colors"
              >
                Start fresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

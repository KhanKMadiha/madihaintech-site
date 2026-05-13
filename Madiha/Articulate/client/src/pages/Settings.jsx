import { useState } from "react";
import { FOCUS_AREA_OPTIONS } from "../lib/constants.js";
import { loadProfile, saveProfile } from "../lib/storage.js";

export default function Settings({ onSaved }) {
  const initial = loadProfile();
  const [name, setName] = useState(initial?.name || "");
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle || "");
  const [industry, setIndustry] = useState(initial?.industry || "");
  const [careerGoal, setCareerGoal] = useState(initial?.careerGoal || "");
  const [focusAreas, setFocusAreas] = useState(initial?.focusAreas || []);
  const [readingStyle, setReadingStyle] = useState(initial?.readingStyle || "checkin");
  const [passageLength, setPassageLength] = useState(initial?.passageLength || "medium");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const toggleFocus = (label) => {
    setFocusAreas((prev) => {
      if (prev.includes(label)) return prev.filter((x) => x !== label);
      if (prev.length >= 3) return prev;
      return [...prev, label];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !jobTitle.trim() || !industry.trim() || !careerGoal.trim()) {
      setError("Please fill in every field.");
      setMessage("");
      return;
    }
    if (focusAreas.length < 1) {
      setError("Choose at least one focus area (up to three).");
      setMessage("");
      return;
    }
    setError("");
    saveProfile({
      name: name.trim(),
      jobTitle: jobTitle.trim(),
      industry: industry.trim(),
      careerGoal: careerGoal.trim(),
      focusAreas: focusAreas.slice(0, 3),
      readingStyle,
      passageLength,
    });
    onSaved?.();
    setMessage("Profile updated.");
    window.setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-inkMuted mb-1">You</p>
        <h1 className="font-serif text-3xl text-ink">Settings</h1>
        <p className="mt-2 font-sans text-inkMuted text-sm leading-relaxed">
          Passages use this context. Tweak it when your priorities shift.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block">
          <span className="block font-sans text-xs font-medium uppercase tracking-wider text-inkMuted mb-1.5">Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="block font-sans text-xs font-medium uppercase tracking-wider text-inkMuted mb-1.5">
            Job title
          </span>
          <input className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </label>
        <label className="block">
          <span className="block font-sans text-xs font-medium uppercase tracking-wider text-inkMuted mb-1.5">
            Industry
          </span>
          <input className="input" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </label>
        <label className="block">
          <span className="block font-sans text-xs font-medium uppercase tracking-wider text-inkMuted mb-1.5">
            2–3 year direction
          </span>
          <textarea
            className="input min-h-[100px] resize-y"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
          />
        </label>

        <fieldset>
          <legend className="block font-sans text-xs font-medium uppercase tracking-wider text-inkMuted mb-2">
            Focus areas (up to 3)
          </legend>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREA_OPTIONS.map((label) => {
              const active = focusAreas.includes(label);
              const disabled = !active && focusAreas.length >= 3;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={disabled}
                  data-active={active}
                  className="chip"
                  onClick={() => toggleFocus(label)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <span className="block font-sans text-xs font-medium uppercase tracking-wider text-inkMuted mb-2">
            Daily flow
          </span>
          <div className="space-y-3">
            <button
              type="button"
              aria-pressed={readingStyle === "direct"}
              className={`onboarding-card text-left ${readingStyle === "direct" ? "onboarding-card--on" : ""}`}
              onClick={() => setReadingStyle("direct")}
            >
              <span className="font-serif text-lg text-ink">Get straight to it</span>
              <span className="block font-sans text-sm text-inkMuted mt-1">Passage first, no check-in.</span>
            </button>
            <button
              type="button"
              aria-pressed={readingStyle === "checkin"}
              className={`onboarding-card text-left ${readingStyle === "checkin" ? "onboarding-card--on" : ""}`}
              onClick={() => setReadingStyle("checkin")}
            >
              <span className="font-serif text-lg text-ink">Quick check-in first</span>
              <span className="block font-sans text-sm text-inkMuted mt-1">Energy and theme before generating.</span>
            </button>
          </div>
        </div>

        <div>
          <span className="block font-sans text-xs font-medium uppercase tracking-wider text-inkMuted mb-2">
            Passage length
          </span>
          <div className="flex rounded-xl border border-border bg-white/50 p-1 gap-1">
            {[
              { id: "short", label: "Short", sub: "2 min" },
              { id: "medium", label: "Medium", sub: "4 min" },
              { id: "long", label: "Long", sub: "6 min" },
            ].map(({ id, label, sub }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPassageLength(id)}
                className={`flex-1 rounded-lg py-2.5 px-2 text-center transition font-sans text-sm ${
                  passageLength === id ? "bg-white text-ink shadow-sm font-semibold" : "text-inkMuted"
                }`}
              >
                <span className="block">{label}</span>
                <span className="block text-[10px] opacity-80">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p className="text-sm text-accent" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-inkMuted" role="status">
            {message}
          </p>
        ) : null}

        <button type="submit" className="btn-primary">
          Save changes
        </button>
      </form>
    </div>
  );
}

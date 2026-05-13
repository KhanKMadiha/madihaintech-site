import { useState } from "react";
import { FOCUS_AREA_OPTIONS } from "../lib/constants.js";
import { saveProfile } from "../lib/storage.js";

const TOTAL = 4;

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [focusAreas, setFocusAreas] = useState([]);
  const [readingStyle, setReadingStyle] = useState(null);
  const [passageLength, setPassageLength] = useState("medium");
  const [error, setError] = useState("");

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  };

  const toggleFocus = (label) => {
    setFocusAreas((prev) => {
      if (prev.includes(label)) return prev.filter((x) => x !== label);
      if (prev.length >= 3) return prev;
      return [...prev, label];
    });
  };

  const advanceFrom1 = () => {
    if (!name.trim()) {
      setError("Add your first name so we can greet you properly.");
      return;
    }
    setError("");
    setStep(2);
  };

  const advanceFrom2 = () => {
    if (!jobTitle.trim() || !industry.trim() || !careerGoal.trim()) {
      setError("A few more details — we use all of this to shape your passages.");
      return;
    }
    setError("");
    setStep(3);
  };

  const advanceFrom3 = () => {
    if (focusAreas.length < 1) {
      setError("Choose at least one focus area — you can pick up to three.");
      return;
    }
    setError("");
    setStep(4);
  };

  const finish = () => {
    if (!readingStyle) {
      setError("Pick how you’d like to start each day.");
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
    onComplete?.();
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="max-w-lg w-full mx-auto px-5 pt-8 pb-16 flex-1 flex flex-col">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="font-sans text-sm text-inkMuted hover:text-ink py-2 -ml-1 pr-4"
              >
                ← Back
              </button>
            ) : (
              <span className="w-16" aria-hidden />
            )}
            <p className="font-sans text-xs text-inkMuted tabular-nums tracking-wide">
              {step} / {TOTAL}
            </p>
          </div>
          <div className="flex gap-2 justify-center" aria-hidden>
            {Array.from({ length: TOTAL }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 max-w-[4.5rem] rounded-full transition-colors ${
                  i < step ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </div>
        </header>

        {step === 1 && (
          <section className="flex-1 flex flex-col">
            <h1 className="font-serif text-[2rem] sm:text-4xl text-ink leading-[1.15] mb-4">
              Let&apos;s build your voice.
            </h1>
            <p className="font-sans text-inkMuted text-lg leading-relaxed mb-10">
              A few quick questions so your daily passages feel written just for you.
            </p>
            <label className="block mb-auto">
              <span className="sr-only">First name</span>
              <input
                className="onboarding-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name"
                autoComplete="given-name"
                autoFocus
              />
            </label>
            {error ? (
              <p className="text-sm text-accent mb-4" role="alert">
                {error}
              </p>
            ) : null}
            <button type="button" className="onboarding-cta mt-8" onClick={advanceFrom1}>
              Let&apos;s go →
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="flex-1 flex flex-col">
            <h1 className="font-serif text-[2rem] sm:text-4xl text-ink leading-[1.15] mb-10">What do you do?</h1>
            <div className="space-y-6 mb-auto">
              <label className="block">
                <span className="onboarding-label">Job title</span>
                <input
                  className="onboarding-input"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder='e.g. "Senior Support Engineer"'
                  autoComplete="organization-title"
                />
              </label>
              <label className="block">
                <span className="onboarding-label">Industry</span>
                <input
                  className="onboarding-input"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder='e.g. "SaaS / Developer Tools"'
                />
              </label>
              <label className="block">
                <span className="onboarding-label">Where do you want to be in 2–3 years?</span>
                <textarea
                  className="onboarding-input min-h-[140px] resize-y leading-relaxed"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder='e.g. "Moving into a technical leadership or management role"'
                />
              </label>
            </div>
            {error ? (
              <p className="text-sm text-accent mb-4" role="alert">
                {error}
              </p>
            ) : null}
            <button type="button" className="onboarding-cta mt-8" onClick={advanceFrom2}>
              Next →
            </button>
          </section>
        )}

        {step === 3 && (
          <section className="flex-1 flex flex-col">
            <h1 className="font-serif text-[2rem] sm:text-4xl text-ink leading-[1.15] mb-3">
              What do you want to get better at?
            </h1>
            <p className="font-sans text-inkMuted text-base leading-relaxed mb-8">
              Pick up to 3. These shape every passage you receive.
            </p>
            <div className="flex flex-wrap gap-2.5 mb-auto">
              {FOCUS_AREA_OPTIONS.map((label) => {
                const active = focusAreas.includes(label);
                const disabled = !active && focusAreas.length >= 3;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={disabled}
                    data-active={active}
                    onClick={() => toggleFocus(label)}
                    className="onboarding-chip"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="font-sans text-sm text-inkMuted mb-2">
              {focusAreas.length} of 3 selected
            </p>
            {error ? (
              <p className="text-sm text-accent mb-4" role="alert">
                {error}
              </p>
            ) : null}
            <button type="button" className="onboarding-cta mt-6" onClick={advanceFrom3}>
              Almost there →
            </button>
          </section>
        )}

        {step === 4 && (
          <section className="flex-1 flex flex-col">
            <h1 className="font-serif text-[2rem] sm:text-4xl text-ink leading-[1.15] mb-8">How do you like to read?</h1>

            <div className="space-y-4 mb-10">
              <button
                type="button"
                onClick={() => setReadingStyle("direct")}
                aria-pressed={readingStyle === "direct"}
                className={`onboarding-card ${readingStyle === "direct" ? "onboarding-card--on" : ""}`}
              >
                <span className="text-2xl mb-2 block" aria-hidden>
                  🎯
                </span>
                <span className="font-serif text-xl text-ink block mb-1">Get straight to it</span>
                <span className="font-sans text-sm text-inkMuted leading-relaxed">
                  Open the app, passage appears, I read.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setReadingStyle("checkin")}
                aria-pressed={readingStyle === "checkin"}
                className={`onboarding-card ${readingStyle === "checkin" ? "onboarding-card--on" : ""}`}
              >
                <span className="text-2xl mb-2 block" aria-hidden>
                  ☀️
                </span>
                <span className="font-serif text-xl text-ink block mb-1">Quick check-in first</span>
                <span className="font-sans text-sm text-inkMuted leading-relaxed">
                  I&apos;ll tell you my energy and pick a theme before generating.
                </span>
              </button>
            </div>

            <div className="mb-auto">
              <p className="onboarding-label mb-3">How long should each passage be?</p>
              <div
                className="flex rounded-2xl border border-border bg-white/50 p-1 gap-1"
                role="group"
                aria-label="Passage length"
              >
                {[
                  { id: "short", label: "Short", sub: "2 min" },
                  { id: "medium", label: "Medium", sub: "4 min" },
                  { id: "long", label: "Long", sub: "6 min" },
                ].map(({ id, label, sub }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPassageLength(id)}
                    className={`flex-1 rounded-xl py-3 px-2 text-center transition font-sans ${
                      passageLength === id
                        ? "bg-white text-ink shadow-sm"
                        : "text-inkMuted hover:text-ink"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-ink">{label}</span>
                    <span className="block text-xs mt-0.5 opacity-80">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <p className="text-sm text-accent mb-4" role="alert">
                {error}
              </p>
            ) : null}
            <button type="button" className="onboarding-cta mt-8" onClick={finish}>
              Start reading →
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

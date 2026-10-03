"use client";
import { useState } from "react";
import { SKILLS } from "@/lib/skills";

type Props = { value: string[]; onChange: (v: string[]) => void; max: number; disabled?: boolean };

export default function SkillPicker({ value, onChange, max, disabled }: Props) {
  const [q, setQ] = useState("");
  const options = [...new Set([...SKILLS, ...value])];

  const toggle = (s: string) =>
    onChange(value.includes(s) ? value.filter((x) => x !== s) : value.length < max ? [...value, s] : value);
  const add = () => {
    const s = q.trim();
    if (s && !value.includes(s) && value.length < max) onChange([...value, s]);
    setQ("");
  };

  return (
    <div inert={disabled} className={disabled ? "opacity-40 pointer-events-none" : ""}>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Don't see it? Type a skill and press Enter"
          aria-label="Add a skill"
          className="w-full rounded-xl border-2 border-ink/15 bg-mist-pure px-4 py-3 focus:border-lagoon text-ink placeholder:text-ink-muted/50 outline-none dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40"
        />
        <button type="button" onClick={add} className="rounded-xl bg-ink px-5 font-medium text-white hover:bg-lagoon transition-colors dark:bg-saffron dark:text-black dark:hover:bg-saffron-light">Add</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((s) => {
          const on = value.includes(s);
          return (
            <button
              key={s} type="button" aria-pressed={on} onClick={() => toggle(s)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                on ? "border-lagoon bg-lagoon text-white" : "border-ink/15 bg-mist-pure text-ink hover:border-lagoon dark:bg-mist-subtle dark:border-white/15"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-ink/60">{value.length} of {max} selected</p>
    </div>
  );
}

import type { Suggestion } from "./store";

interface Track {
  id: string;
  title: string;
  category: "grounding" | "lofi" | "focus" | "uplift" | "night";
  mood: string[];
  tags: string[];
  url: string;
  length: number; // seconds
}

export const TRACKS: Track[] = [
  {
    id: "ground_pad_60",
    title: "Grounding Pad (60 BPM)",
    category: "grounding",
    mood: ["calm", "centered"],
    tags: ["breathwork", "reset", "relax"],
    url: "/audio/tunetank.com_831_ocean-breeze_by_enrize.mp3",
    length: 90,
  },
  {
    id: "slow_air_glide",
    title: "Slow Air Glide",
    category: "grounding",
    mood: ["calm"],
    tags: ["breath", "soothing"],
    url: "/audio/tunetank.com_5823_science-research_by_decibel.mp3",
    length: 120,
  },
  {
    id: "lofi_soft_keys_1",
    title: "Soft Keys Lofi Loop",
    category: "lofi",
    mood: ["calm", "comfort"],
    tags: ["relax", "study"],
    url: "/audio/tunetank.com_5808_coffee-time_by_pure.mp3",
    length: 75,
  },
  {
    id: "lofi_midnight",
    title: "Midnight Window",
    category: "lofi",
    mood: ["calm", "reflective"],
    tags: ["journaling", "night"],
    url: "/audio/tunetank.com_5937_calm-lake_by_finval.mp3",
    length: 95,
  },
  {
    id: "focus_brown_noise",
    title: "Deep Focus (Brown Noise)",
    category: "focus",
    mood: ["focus"],
    tags: ["work", "deepfocus", "noise"],
    url: "/audio/tunetank.com_3231_morning-fog_by_finval.mp3",
    length: 300,
  },
  {
    id: "pulse_focus_80",
    title: "Pulse Loop (80 BPM)",
    category: "focus",
    mood: ["focus", "steady"],
    tags: ["micro-reset", "flow"],
    url: "/audio/tunetank.com_202_new-opportunities_by_motion-productions.mp3",
    length: 120,
  },
  {
    id: "uplift_chimes",
    title: "Uplift Chimes",
    category: "uplift",
    mood: ["energize", "fresh"],
    tags: ["reset", "bounce"],
    url: "/audio/tunetank.com_4109_good-morning_by_rocknstock.mp3",
    length: 60,
  },
  {
    id: "bright_shift",
    title: "Bright Shift",
    category: "uplift",
    mood: ["light", "positive"],
    tags: ["reward", "break"],
    url: "/audio/tunetank.com_1218_indie-music_by_rocknstock.mp3",
    length: 70,
  },
  {
    id: "deep_mono_pad",
    title: "Deep Mono Pad",
    category: "night",
    mood: ["sleep", "relax"],
    tags: ["low", "warm"],
    url: "/audio/tunetank.com_6449_good-night_by_ostin.mp3",
    length: 150,
  },
  {
    id: "dream_oscillations",
    title: "Dream Oscillations",
    category: "night",
    mood: ["dreamy", "soft"],
    tags: ["night", "dream"],
    url: "/audio/tunetank.com_6705_night-city_by_musicstockproduction.mp3",
    length: 160,
  },
];

const MOOD_ALIASES: Record<string, string[]> = {
  happy: ["light", "positive", "energize", "fresh"],
  sad: ["calm", "comfort", "relax", "grounding"],
  angry: ["calm", "centered", "grounding"],
  anxious: ["calm", "centered", "focus", "relax"],
  calm: ["calm", "night", "comfort"],
  energetic: ["energize", "focus", "steady"],
  contemplative: ["reflective", "dreamy", "soft", "lofi"],
  joyful: ["light", "positive", "energize"],
  melancholy: ["dreamy", "soft", "night", "calm"],
  neutral: ["calm", "focus", "light"],
};

const CATEGORY_ORDER: Track["category"][] = [
  "grounding",
  "lofi",
  "focus",
  "uplift",
  "night",
];

const formatDuration = (seconds: number): string => {
  if (seconds >= 60) {
    const minutes = seconds / 60;
    return minutes % 1 === 0 ? `${minutes.toFixed(0)} min` : `${minutes.toFixed(1)} min`;
  }
  return `${seconds}s`;
};

const toTitleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

export const getTrackSuggestions = (
  mood: string | undefined,
  limit = 1
): Suggestion[] => {
  const normalizedMood = mood?.toLowerCase() ?? "neutral";
  const aliasSet = new Set([normalizedMood, ...(MOOD_ALIASES[normalizedMood] ?? [])]);

  const prioritized = TRACKS.filter(
    (track) =>
      track.mood.some((m) => aliasSet.has(m)) ||
      track.tags.some((tag) => aliasSet.has(tag)) ||
      aliasSet.has(track.category)
  );

  const orderedFallbacks = CATEGORY_ORDER.flatMap((category) =>
    TRACKS.filter((track) => track.category === category)
  );

  const pool = [...prioritized, ...orderedFallbacks].filter(
    (track, index, arr) => arr.findIndex((candidate) => candidate.id === track.id) === index
  );

  const selections: Suggestion[] = [];

  for (const track of pool) {
    selections.push({
      type: "music",
      title: track.title,
      subtitle: `${toTitleCase(track.category)} • ${formatDuration(track.length)}`,
      previewUrl: track.url,
      link: track.url,
      mood: track.mood[0],
    });

    if (selections.length >= limit) {
      break;
    }
  }

  return selections;
};

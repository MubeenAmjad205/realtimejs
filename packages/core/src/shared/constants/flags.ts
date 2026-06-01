export const FEATURE_FLAGS = {
  ENABLE_CHAT: true,
  ENABLE_PRESENCE: true,
  ENABLE_TYPING: true,
  ENABLE_OFFLINE_SYNC: false, // Planned for v2
  ENABLE_ANALYTICS: false, // Planned for v4
} as const;

export type FeatureFlags = typeof FEATURE_FLAGS;

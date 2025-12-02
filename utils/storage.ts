// This file is loaded on Mobile.
// We export a dummy object that matches the PostHog storage interface.
// Since you are using persistence: 'memory' on mobile, these functions
// won't actually be called, but they prevent the TypeScript error.

export const AppStorage = {
  getItem: async (key: string) => null,
  setItem: async (key: string, value: string) => {},
  removeItem: async (key: string) => {},
};

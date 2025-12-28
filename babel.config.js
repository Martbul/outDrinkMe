module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // 1. Re-add the worklets plugin for Reanimated 4
      "react-native-worklets/plugin",
      // 2. Ensure your other plugins (like tailwind) are here if you had them
    ],
  };
};
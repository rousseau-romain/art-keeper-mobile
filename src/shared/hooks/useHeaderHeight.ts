// Expo Router vendors @react-navigation/elements internally and does NOT
// re-export useHeaderHeight. This vendored path is the only source that reads
// the same HeaderHeightContext the Expo Router <Stack> provides — a separately
// installed @react-navigation/elements would read a different context instance
// and return only the default header height.
export { useHeaderHeight } from "expo-router/build/react-navigation/elements";

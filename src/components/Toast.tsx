import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FONT_SIZE, SPACING, useTheme } from "@/theme";

interface ToastContextValue {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION = 2200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useMemo(() => new Animated.Value(0), []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(msg);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => setMessage(null));
      }, DURATION);
    },
    [opacity],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message ? <ToastView message={message} opacity={opacity} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({
  message,
  opacity,
}: {
  message: string;
  opacity: Animated.Value;
}) {
  const { t, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.overlay,
        { paddingBottom: insets.bottom + SPACING.xl },
        { opacity },
      ]}
    >
      <View
        style={{
          backgroundColor: t.surface2,
          borderColor: t.line,
          borderWidth: t.borderWeight,
          borderRadius: t.radius,
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          maxWidth: "86%",
          ...t.shadow,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: FONT_SIZE.base,
            color: t.ink,
          }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { justifyContent: "flex-end", alignItems: "center" },
});

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

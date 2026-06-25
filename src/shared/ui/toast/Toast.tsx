import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import {
  type ToastVariant,
  useToastColors,
} from "@/shared/ui/toast/hooks/useToastColors";
import { ColorEnum } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION = 2200;

type ToastState = { message: string; variant: ToastVariant };

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useMemo(() => new Animated.Value(0), []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, variant });
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
        }).start(() => setToast(null));
      }, DURATION);
    },
    [opacity]
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <ToastView
          message={toast.message}
          variant={toast.variant}
          opacity={opacity}
        />
      )}
    </ToastContext.Provider>
  );
};

function ToastView({
  message,
  variant,
  opacity,
}: {
  message: string;
  variant: ToastVariant;
  opacity: Animated.Value;
}) {
  const insets = useSafeAreaInsets();
  const { bg, accent, icon } = useToastColors(variant);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.overlay,
        { paddingBottom: insets.bottom + SpacingEnum.xl },
        { opacity },
      ]}
    >
      <View
        style={[
          styles.bubble,
          { backgroundColor: ColorEnum[bg], borderColor: ColorEnum[accent] },
        ]}
      >
        <Icon name={icon} size="sm" color={accent} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { justifyContent: "flex-end", alignItems: "center" },
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.sm,
    borderWidth: 1.5,
    borderRadius: RadiusEnum.sm,
    paddingHorizontal: SpacingEnum.lg,
    paddingVertical: SpacingEnum.md,
    maxWidth: "86%",
  },
  message: { flexShrink: 1 },
});

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { useArtworks } from "@/lib/api/artworks";
import { ColorEnum } from "@/theme/enums/color.enums";

export type HeroGridProps = Record<string, never>;

// Decorative full-bleed grid of artwork thumbnails behind the desktop hero text.
// Sits under a scrim (see LoginScreen) and ignores touches so the form/links
// beneath stay interactive. Renders nothing until there are images to show, so
// the hero's surface2 + scrim look intentional while logged out or loading.
const TILE_CAP = 12;
const COLS = 3;
// Ambient auto-scroll speed, in px/second — slow and steady.
const SCROLL_SPEED = 20;

export const HeroGrid = () => {
  const { artworks } = useArtworks();
  const translateY = useRef(new Animated.Value(0)).current;
  const [copyHeight, setCopyHeight] = useState(0);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const images = artworks.map((a) => a.imageUrl).slice(0, TILE_CAP);

  // Repeat the source images until one copy is at least a viewport tall, so the
  // marquee's seam between the two stacked copies never scrolls into view even
  // when only a handful of artworks loaded. Each tile is viewportWidth/COLS tall.
  const tileCount =
    images.length > 0 && viewport.width > 0 && viewport.height > 0
      ? Math.max(
          images.length,
          (Math.ceil(viewport.height / (viewport.width / COLS)) + 1) * COLS,
        )
      : images.length;
  const tiles = Array.from(
    { length: tileCount },
    (_, i) => images[i % images.length],
  );

  // Loop a single copy's worth of upward travel: the second (identical) copy
  // lands exactly where the first began, so the reset to 0 is seamless.
  useEffect(() => {
    if (copyHeight <= 0) return;
    translateY.setValue(0);
    const anim = Animated.loop(
      Animated.timing(translateY, {
        toValue: -copyHeight,
        duration: (copyHeight / SCROLL_SPEED) * 1000,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [copyHeight, translateY]);

  if (tiles.length === 0) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.viewport]}
      pointerEvents="none"
      onLayout={(e) =>
        setViewport({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }
    >
      <Animated.View style={{ transform: [{ translateY }] }}>
        <View
          style={styles.copy}
          onLayout={(e) => setCopyHeight(e.nativeEvent.layout.height)}
        >
          {tiles.map((uri, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static repeated decorative tiles
            <View key={`a-${uri}-${i}`} style={styles.tile}>
              <Image source={{ uri }} style={styles.image} contentFit="cover" />
            </View>
          ))}
        </View>
        <View style={styles.copy}>
          {tiles.map((uri, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static repeated decorative tiles
            <View key={`b-${uri}-${i}`} style={styles.tile}>
              <Image source={{ uri }} style={styles.image} contentFit="cover" />
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  viewport: { overflow: "hidden" },
  copy: { flexDirection: "row", flexWrap: "wrap" },
  tile: {
    width: "33.333%",
    aspectRatio: 1,
    backgroundColor: ColorEnum.surface2,
  },
  image: { width: "100%", height: "100%" },
});

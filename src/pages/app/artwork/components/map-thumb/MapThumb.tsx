import { Image, Pressable, StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import {
  ControlHeightEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";

export type MapThumbProps = {
  artwork: Artwork;
  /** Highlighted (its pin is selected on the map). */
  active: boolean;
  onPress: () => void;
};

/** One thumbnail in the bottom "pieces in view" strip of the map. */
export const MapThumb = ({ artwork, active, onPress }: MapThumbProps) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={artwork.title}
      style={styles.thumb}
    >
      <View
        style={[
          styles.frame,
          { borderColor: active ? ColorEnum.accent : ColorEnum.hair },
        ]}
      >
        <Image
          source={{ uri: artwork.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <Text
        font="mono"
        size="xs"
        numberOfLines={1}
        color={active ? "accent" : "inkMute"}
        style={styles.label}
      >
        {artwork.title}
      </Text>
    </Pressable>
  );
};

const THUMB = ControlHeightEnum.lg;

const styles = StyleSheet.create({
  thumb: { width: THUMB, gap: SpacingEnum.xs },
  frame: {
    width: THUMB,
    height: THUMB,
    borderWidth: 1.5,
    borderRadius: RadiusEnum.sm,
    overflow: "hidden",
    backgroundColor: ColorEnum.surface2,
  },
  image: { width: "100%", height: "100%" },
  label: { textAlign: "center", textTransform: "lowercase" },
});

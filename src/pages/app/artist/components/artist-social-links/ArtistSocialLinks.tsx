import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import type { SocialLinks } from "@/lib/api/artists";
import type { IconName } from "@/shared/ui/icon/Icon";
import { IconButton } from "@/shared/ui/icon-button/IconButton";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtistSocialLinksProps = {
  socialLinks: SocialLinks;
};

type Platform = keyof SocialLinks;

// Per-platform icon + a11y label. The API stores each entry as a full URL, so
// there's nothing to build — we open the value as-is. lucide-react-native ships
// no brand glyphs, so each platform gets a close generic icon; the a11y label
// names the platform. Order fixes the row's display order.
const CONFIG: Record<Platform, { icon: IconName; label: string }> = {
  instagram: { icon: "Camera", label: "Instagram" },
  twitter: { icon: "AtSign", label: "X" },
  facebook: { icon: "ThumbsUp", label: "Facebook" },
  tiktok: { icon: "Music2", label: "TikTok" },
  website: { icon: "Globe", label: "Website" },
};

const ORDER: Platform[] = [
  "instagram",
  "twitter",
  "facebook",
  "tiktok",
  "website",
];

/** Row of social icon links — one per non-empty entry of the artist's `socialLinks`. */
export const ArtistSocialLinks = ({ socialLinks }: ArtistSocialLinksProps) => {
  const { t: tr } = useTranslation();

  const entries = ORDER.filter((platform) => !!socialLinks[platform]?.trim());
  if (entries.length === 0) return null;

  return (
    <View style={styles.row}>
      {entries.map((platform) => {
        const value = socialLinks[platform] as string;
        const { icon, label } = CONFIG[platform];
        return (
          <IconButton
            key={platform}
            name={icon}
            color="text"
            onPress={() => Linking.openURL(value)}
            accessibilityLabel={tr("a11y.socialLink", { platform: label })}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.lg },
});

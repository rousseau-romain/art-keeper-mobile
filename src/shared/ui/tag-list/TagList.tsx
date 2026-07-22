import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { List } from "@/shared/ui/seo/list/List";
import { ListItem } from "@/shared/ui/seo/list-item/ListItem";
import { Tag } from "@/shared/ui/tag/Tag";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type TagListProps = {
  tags: string[];
};

/**
 * A row of tags as links into the filtered browse listing (a real `<a href>` on
 * web via `Link asChild` — see the link-aschild-pressable rule). Renders nothing
 * when there are no tags. Shared by the artwork and artist detail views.
 */
export const TagList = ({ tags }: TagListProps) => {
  const { t: tr } = useTranslation();
  if (tags.length === 0) return null;
  return (
    <List style={styles.tags}>
      {tags.map((tag) => (
        <ListItem key={tag}>
          <Link href={{ pathname: "/artworks", params: { tag } }} asChild>
            <Tag
              label={tag}
              accessibilityLabel={tr("a11y.searchTag", { tag })}
            />
          </Link>
        </ListItem>
      ))}
    </List>
  );
};

const styles = StyleSheet.create({
  tags: { flexDirection: "row", flexWrap: "wrap", gap: SpacingEnum.sm },
});

import { Heading } from "@/shared/ui/seo/heading/Heading";
import type { TextProps } from "@/shared/ui/text/Text";

export type H6Props = TextProps;

export const H6 = (props: H6Props) => <Heading level={6} {...props} />;

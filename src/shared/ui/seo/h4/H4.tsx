import { Heading } from "@/shared/ui/seo/heading/Heading";
import type { TextProps } from "@/shared/ui/text/Text";

export type H4Props = TextProps;

export const H4 = (props: H4Props) => <Heading level={4} {...props} />;

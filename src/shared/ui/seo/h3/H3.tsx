import { Heading } from "@/shared/ui/seo/heading/Heading";
import type { TextProps } from "@/shared/ui/text/Text";

export type H3Props = TextProps;

export const H3 = (props: H3Props) => <Heading level={3} {...props} />;

import { Heading } from "@/shared/ui/seo/heading/Heading";
import type { TextProps } from "@/shared/ui/text/Text";

export type H1Props = TextProps;

export const H1 = (props: H1Props) => <Heading level={1} {...props} />;

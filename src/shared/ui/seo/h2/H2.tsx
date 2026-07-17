import { Heading } from "@/shared/ui/seo/heading/Heading";
import type { TextProps } from "@/shared/ui/text/Text";

export type H2Props = TextProps;

export const H2 = (props: H2Props) => <Heading level={2} {...props} />;

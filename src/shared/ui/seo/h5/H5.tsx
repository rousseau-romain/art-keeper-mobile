import { Heading } from "@/shared/ui/seo/heading/Heading";
import type { TextProps } from "@/shared/ui/text/Text";

export type H5Props = TextProps;

export const H5 = (props: H5Props) => <Heading level={5} {...props} />;

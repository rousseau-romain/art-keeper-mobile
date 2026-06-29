import Head from "expo-router/head";

export type SeoProps = {
  title: string;
  description?: string;
  image?: string;
};

/**
 * Document `<head>` metadata for an indexable page — title + description + Open
 * Graph tags. Built on `expo-router/head` (react-helmet), so it hoists into the
 * document head from anywhere in the tree and is a no-op on native. Render it
 * only once the page's data is loaded (the success branch).
 */
export const Seo = ({ title, description, image }: SeoProps) => (
  <Head>
    <title>{title}</title>
    <meta property="og:title" content={title} />
    {description && (
      <>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
      </>
    )}
    {image ?? <meta property="og:image" content={image} />}
  </Head>
);

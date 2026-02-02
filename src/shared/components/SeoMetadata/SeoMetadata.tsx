import { type FC } from 'react';

import './SeoMetadata.scss';
import { Helmet } from 'react-helmet';
import { GENERATE_SITE_TITLE } from '../../../constants.ts';

interface SeoMetadataProps {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  url?: string | null;
  updatedAt?: string | null;
  keywords?: string[] | null;
  publishedAt?: string | null;
  createdAt?: string | null;
}

export const SeoMetadata: FC<SeoMetadataProps> = ({
  title,
  description,
  image,
  url,
  updatedAt,
  keywords,
  publishedAt,
  createdAt,
}) => {
  return (
    <Helmet>
      {!!title && <title>{GENERATE_SITE_TITLE(title)}</title>}
      {!!description && <meta name="description" content={description} />}
      {!!title && <meta property="og:title" content={title} />}
      {!!url && <meta property="og:url" content={url} />}
      {!!image && <meta property="og:image" content={image} />}
      {!!updatedAt && <meta property="og:updated_time" content={updatedAt} />}
      {!!publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {!!createdAt && <meta property="og:created_time" content={createdAt} />}
      {<meta property="publisher" content="Het Archief voor Onderwijs" />}
      {!!keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <meta property="og:site_name" content="Het Archief voor Onderwijs" />
      <meta name="language" content="NL" />
    </Helmet>
  );
};

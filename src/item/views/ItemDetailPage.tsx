import { AvoItemItem } from '@viaa/avo2-types';
import { type FC } from 'react';
import { useLoaderData, useParams } from 'react-router';
import { SeoMetadata } from '../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { tText } from '../../shared/helpers/translate-text.ts';
import { ItemDetail } from './ItemDetail';

export const ItemDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const loaderData = useLoaderData<{
    item: AvoItemItem;
    url: string;
  }>();
  return (
    <>
      <SeoMetadata
        title={
          loaderData?.item?.title ||
          tText('item/views/item-detail___item-detail-pagina-titel-fallback')
        }
        description={loaderData?.item?.description || ''}
        image={loaderData?.item?.seo_image_path}
      />
      <ItemDetail key={'item-detail'} id={id} initialItem={loaderData.item} />
    </>
  );
};

export default ItemDetailPage;

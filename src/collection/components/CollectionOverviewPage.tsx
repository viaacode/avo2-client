import { noop } from 'es-toolkit';
import { type FC } from 'react';
import { CollectionOrBundle } from '../collection.types';
import { CollectionOrBundleOverview } from './CollectionOrBundleOverview.tsx';

export const CollectionOverviewPage: FC = () => {
  return (
    <CollectionOrBundleOverview
      type={CollectionOrBundle.COLLECTION}
      onUpdate={noop}
    ></CollectionOrBundleOverview>
  );
};

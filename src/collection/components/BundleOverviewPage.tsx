import { noop } from 'es-toolkit';
import { type FC } from 'react';
import { CollectionOrBundle } from '../collection.types';
import { CollectionOrBundleOverview } from './CollectionOrBundleOverview.tsx';

export const BundleOverviewPage: FC = () => {
  return (
    <CollectionOrBundleOverview
      type={CollectionOrBundle.BUNDLE}
      onUpdate={noop}
    ></CollectionOrBundleOverview>
  );
};

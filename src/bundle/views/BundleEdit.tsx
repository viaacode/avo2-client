import { type FC } from 'react'

import { CollectionOrBundle } from '../../collection/collection.types';
import { CollectionOrBundleEdit } from '../../collection/components/CollectionOrBundleEdit';

export const BundleEdit: FC = () => {
  return <CollectionOrBundleEdit type={CollectionOrBundle.BUNDLE} />
}

export default BundleEdit

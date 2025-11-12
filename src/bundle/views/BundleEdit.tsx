import React, { type FC } from 'react'

import { CollectionOrBundle } from '../../collection/collection.types.js'
import { CollectionOrBundleEdit } from '../../collection/components/CollectionOrBundleEdit.js'

export const BundleEdit: FC = () => {
  return <CollectionOrBundleEdit type={CollectionOrBundle.BUNDLE} />
}

export default BundleEdit

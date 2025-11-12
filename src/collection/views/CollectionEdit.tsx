import React, { type FC } from 'react';

import { CollectionOrBundle } from '../collection.types.js';
import { CollectionOrBundleEdit } from '../components/CollectionOrBundleEdit.js';

export const CollectionEdit: FC = () => {
	return <CollectionOrBundleEdit type={CollectionOrBundle.COLLECTION} />;
};

export default CollectionEdit;

import React, { type FC } from 'react';

import { CollectionOrBundle } from '../collection.types';
import { CollectionOrBundleEdit } from '../components/CollectionOrBundleEdit';

export const CollectionEdit: FC = () => {
	return <CollectionOrBundleEdit type={CollectionOrBundle.COLLECTION} />;
};

export default CollectionEdit;

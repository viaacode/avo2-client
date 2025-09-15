import React, { type FC } from 'react';

import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { CollectionOrBundle } from '../../collection/collection.types';
import CollectionOrBundleEdit from '../../collection/components/CollectionOrBundleEdit';

type CollectionEditProps = DefaultSecureRouteProps<{ id: string }>;

const BundleEdit: FC<CollectionEditProps> = (props) => {
	return <CollectionOrBundleEdit {...props} type={CollectionOrBundle.BUNDLE} />;
};

export default BundleEdit;

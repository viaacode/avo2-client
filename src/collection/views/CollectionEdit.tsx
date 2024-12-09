import React, { type FC } from 'react';
import { withRouter } from 'react-router';

import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { CollectionOrBundle } from '../collection.types';
import CollectionOrBundleEdit from '../components/CollectionOrBundleEdit';

type CollectionEditProps = DefaultSecureRouteProps<{ id: string }>;

const CollectionEdit: FC<CollectionEditProps> = (props) => {
	return <CollectionOrBundleEdit {...props} type={CollectionOrBundle.COLLECTION} />;
};

export default withRouter(CollectionEdit);

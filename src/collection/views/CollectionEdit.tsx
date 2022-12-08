import React, { FunctionComponent } from 'react';
import { withRouter } from 'react-router';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import CollectionOrBundleEdit from '../components/CollectionOrBundleEdit';

type CollectionEditProps = DefaultSecureRouteProps<{ id: string }>;

const CollectionEdit: FunctionComponent<CollectionEditProps> = (props) => {
	return <CollectionOrBundleEdit {...props} type="collection" />;
};

export default withRouter(CollectionEdit);

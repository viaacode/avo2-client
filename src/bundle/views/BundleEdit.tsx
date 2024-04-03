import React, { type FunctionComponent } from 'react';
import { withRouter } from 'react-router';

import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import CollectionOrBundleEdit from '../../collection/components/CollectionOrBundleEdit';

type CollectionEditProps = DefaultSecureRouteProps<{ id: string }>;

const BundleEdit: FunctionComponent<CollectionEditProps> = (props) => {
	return <CollectionOrBundleEdit {...props} type="bundle" />;
};

export default withRouter(BundleEdit);

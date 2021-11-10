import React, { FunctionComponent } from 'react';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';

interface QuickLaneDetailProps extends DefaultSecureRouteProps<{}> {}

const QuickLaneDetail: FunctionComponent<QuickLaneDetailProps> = () => {
	return <div>QuickLaneDetailProps</div>;
};

export default QuickLaneDetail;

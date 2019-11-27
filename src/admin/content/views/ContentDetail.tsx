import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { AdminLayout } from '../../shared/layouts';
import { CONTENT_PATH } from '../content.const';

interface ContentDetailProps extends RouteComponentProps {}

const ContentDetail: FunctionComponent<ContentDetailProps> = ({ history }) => (
	<AdminLayout pageTitle="Content: titel" navigateBack={() => history.push(CONTENT_PATH.CONTENT)} />
);

export default withRouter(ContentDetail);

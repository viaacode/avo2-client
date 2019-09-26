import React, { Fragment, FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

interface AssignmentProps extends RouteComponentProps {
	assignmentId: number;
}

const Assignment: FunctionComponent<AssignmentProps> = ({ history, assignmentId }) => {
	return <Fragment>TODO assignment detail page</Fragment>;
};

export default withRouter(Assignment);

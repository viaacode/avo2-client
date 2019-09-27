import React, { Fragment, FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

interface AssignmentsProps extends RouteComponentProps {}

const Assignments: FunctionComponent<AssignmentsProps> = ({ history }) => {
	return <Fragment>TODO assignments overview page</Fragment>;
};

export default withRouter(Assignments);

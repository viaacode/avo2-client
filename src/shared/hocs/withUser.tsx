import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { selectUser } from '../../authentication/store/selectors';
import { AppState } from '../../store';

const withUser = (WrappedComponent: FunctionComponent) => {
	return (props: any) => {
		return <WrappedComponent {...props} />;
	};
};

const mapStateToProps = (state: AppState) => ({
	user: selectUser(state),
});

export default compose(
	connect(mapStateToProps),
	withUser
);

import { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { selectUser } from '../../authentication/store/selectors';
import { AppState } from '../../store';

const withUser = (WrappedComponent: FunctionComponent) => {
	return React.memo(function withUser(props: any) {
		return <WrappedComponent {...props} />;
	});
};

const mapStateToProps = (state: AppState) => ({
	user: selectUser(state),
});

export default compose(connect(mapStateToProps), withUser);

export interface UserProps {
	user: Avo.User.User | undefined;
}

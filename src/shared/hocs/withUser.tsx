import { type Avo } from '@viaa/avo2-types';
import React, { type FC } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { selectCommonUser, selectUser } from '../../authentication/store/selectors';
import { type AppState } from '../../store';

const withUser = (WrappedComponent: FC) => {
	return React.memo(function withUser(props: any) {
		return <WrappedComponent {...props} />;
	});
};

const mapStateToProps = (state: AppState) => ({
	user: selectUser(state),
	commonUser: selectCommonUser(state),
});

export default compose(connect(mapStateToProps), withUser);

export interface UserProps {
	/**
	 * @deprecated Prefer to use commonUser instead
	 */
	user: Avo.User.User | undefined;
	commonUser: Avo.User.CommonUser | undefined;
}

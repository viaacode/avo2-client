import React, { type FC } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { type AppState } from '../../store';
import { selectIsSmartSchoolEmbedFlow } from '../../store/selectors';

const withEmbedFlow = (WrappedComponent: FC) => {
	return React.memo(function withEmbedFlow(props: any) {
		return <WrappedComponent {...props} />;
	});
};

const mapStateToProps = (state: AppState) => ({
	isSmartSchoolEmbedFlow: selectIsSmartSchoolEmbedFlow(state),
});

export default compose(connect(mapStateToProps), withEmbedFlow);

export interface EmbedFlowProps {
	isSmartSchoolEmbedFlow: boolean;
}

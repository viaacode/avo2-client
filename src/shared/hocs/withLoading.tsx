import { Spinner } from '@viaa/avo2-components';
import React, { ComponentType } from 'react';

interface WithLoadingProps {
	loading: boolean;
}

const withLoading = (WrappedComponent: ComponentType<any>): ComponentType<any> =>
	React.memo(function withLoading(props: WithLoadingProps) {
		return props.loading ? <Spinner size="large" /> : <WrappedComponent {...props} />;
	});

export default withLoading;

import React, { ComponentType } from 'react';

import { Spinner } from '@viaa/avo2-components';

interface WithLoadingProps {
	loading: boolean;
}

const withLoading = (WrappedComponent: ComponentType<any>): ComponentType<any> => (
	props: WithLoadingProps
) => {
	return props.loading ? <Spinner size="large" /> : <WrappedComponent {...props} />;
};

export default withLoading;

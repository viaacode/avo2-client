import { get } from 'lodash-es';

import { CheckLoginState } from './types';

const selectCheckLoginState = ({ checkLoginState }: { checkLoginState: CheckLoginState }) => {
	return get(checkLoginState, ['data']);
};

const selectCheckLoginStateLoading = ({
	checkLoginState,
}: {
	checkLoginState: CheckLoginState;
}) => {
	return get(checkLoginState, ['loading']);
};

const selectCheckLoginStateError = ({ checkLoginState }: { checkLoginState: CheckLoginState }) => {
	return get(checkLoginState, ['error']);
};

export { selectCheckLoginState, selectCheckLoginStateLoading, selectCheckLoginStateError };

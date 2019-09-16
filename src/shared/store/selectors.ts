import { get } from 'lodash-es';

import { PlayerTokenState } from './types';

const selectPlayerToken = ({ playerTokenState }: { playerTokenState: PlayerTokenState }) => {
	return get(playerTokenState, ['data']);
};

const selectPlayerTokenLoading = ({ playerTokenState }: { playerTokenState: PlayerTokenState }) => {
	return get(playerTokenState, ['loading']);
};

const selectPlayerTokenError = ({ playerTokenState }: { playerTokenState: PlayerTokenState }) => {
	return get(playerTokenState, ['error']);
};

export { selectPlayerToken, selectPlayerTokenLoading, selectPlayerTokenError };

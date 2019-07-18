import { CheckLoginState } from './types';

const initialState: CheckLoginState = Object.freeze({
	data: null,
	loading: false,
	error: false,
});

export default initialState;

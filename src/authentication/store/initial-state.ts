import { LoginState } from './types';

const initialState: LoginState = Object.freeze({
	data: null,
	loading: false,
	error: false,
});

export default initialState;

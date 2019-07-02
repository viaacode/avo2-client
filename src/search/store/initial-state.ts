import { SearchState } from './types';

const initialState: SearchState = Object.freeze({
	data: null,
	loading: false,
	error: false,
});

export default initialState;

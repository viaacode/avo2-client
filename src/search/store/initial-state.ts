import { SearchState } from './types';

const initialState: SearchState = Object.freeze({
	results: null,
	loading: false,
	error: false,
});

export default initialState;

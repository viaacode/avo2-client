import { type SearchState } from './types';

const initialState: SearchState = Object.freeze({
	data: null,
	loading: false,
	error: false,
	controller: null,
});

export default initialState;

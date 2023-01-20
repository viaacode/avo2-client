import { Action } from 'redux';

type Handler<S> = (state: S, action: any) => S;

export function createReducer<State>(
	initialState: State,
	handlers: { [type: string]: Handler<State> }
): Handler<State> {
	return (state: State = initialState, action: Action): State => {
		if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
			return handlers[action.type](state, action);
		}

		return state;
	};
}

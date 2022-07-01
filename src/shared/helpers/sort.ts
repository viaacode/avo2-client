import { Positioned } from '../types';

export const sortByPositionAsc = (a: Positioned<unknown>, b: Positioned<unknown>) =>
	a.position - b.position;

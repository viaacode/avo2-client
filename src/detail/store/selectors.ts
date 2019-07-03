import { get } from 'lodash-es';

import { DetailState } from './types';

const selectDetail = ({ detail }: { detail: DetailState }, id: string) => {
	return get(detail, [id, 'data']);
};

const selectDetailLoading = ({ detail }: { detail: DetailState }, id: string) => {
	return get(detail, [id, 'loading']);
};

const selectDetailError = ({ detail }: { detail: DetailState }, id: string) => {
	return get(detail, [id, 'error']);
};

export { selectDetail, selectDetailLoading, selectDetailError };

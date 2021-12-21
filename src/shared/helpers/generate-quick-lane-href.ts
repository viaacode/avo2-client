import { generatePath } from 'react-router';

import { APP_PATH } from '../../constants';

export const generateQuickLaneHref = (id: string): string => {
	return generatePath(APP_PATH.QUICK_LANE.route, { id });
};

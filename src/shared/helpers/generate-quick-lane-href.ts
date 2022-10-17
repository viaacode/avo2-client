import { TFunction } from 'i18next';
import { generatePath } from 'react-router';

import { APP_PATH } from '../../constants';
import { ToastService } from '../services/toast-service';

export const generateQuickLaneHref = (id: string): string => {
	return generatePath(APP_PATH.QUICK_LANE.route, { id });
};

export const copyQuickLaneToClipboard = (id: string, t: TFunction): void => {
	navigator.clipboard
		.writeText(`${window.location.origin}${generateQuickLaneHref(id)}`)
		.then(() => {
			ToastService.success(
				t('shared/helpers/generate-quick-lane-href___de-link-is-succesvol-gekopieerd')
			);
		});
};

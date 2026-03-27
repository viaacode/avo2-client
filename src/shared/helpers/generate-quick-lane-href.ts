import { APP_PATH } from '../../constants';
import { ToastService } from '../services/toast-service';
import { buildLink } from './build-link.ts';
import { getEnv } from './env.ts';
import { tHtml } from './translate-html';

export const generateQuickLaneHref = (id: string): string => {
  return buildLink(APP_PATH.QUICK_LANE.route, { id });
};

export const copyQuickLaneToClipboard = (id: string): void => {
  navigator.clipboard
    .writeText(`${getEnv('CLIENT_URL')}${generateQuickLaneHref(id)}`)
    .then(() => {
      ToastService.success(
        tHtml(
          'shared/helpers/generate-quick-lane-href___de-link-is-succesvol-gekopieerd',
        ),
      );
    });
};

import { IconName } from '@viaa/avo2-components';

import i18n from '../../../shared/translations/i18n';
import { ReactSelectOption } from '../../../shared/types';

export const ADMIN_ICON_OPTIONS: ReactSelectOption<IconName>[] = [
	{ label: i18n.t('Afbeelding'), value: 'image' },
	{ label: i18n.t('admin/menu/menu___aktetas'), value: 'briefcase' },
	{ label: i18n.t('Audio'), value: 'headphone' },
	{ label: i18n.t('Collectie'), value: 'collection' },
	{ label: i18n.t('Download'), value: 'download' },
	{ label: i18n.t('Externe link'), value: 'external-link' },
	{ label: i18n.t('Help'), value: 'help-circle' },
	{ label: i18n.t('Info'), value: 'info' },
	{ label: i18n.t('Kalender'), value: 'calendar' },
	{ label: i18n.t('Klascement'), value: 'klascement' },
	{ label: i18n.t('Link'), value: 'link-2' },
	{ label: i18n.t('Link delen'), value: 'share-2' },
	{ label: i18n.t('Login'), value: 'log-in' },
	{ label: i18n.t('Opdracht'), value: 'clipboard' },
	{ label: i18n.t('Profiel'), value: 'user' },
	{ label: i18n.t('Smartschool'), value: 'smartschool' },
	{ label: i18n.t('Tekstbestand'), value: 'file-text' },
	{ label: i18n.t('Uploaden'), value: 'upload' },
	{ label: i18n.t('Video'), value: 'video' },
	{ label: i18n.t('View'), value: 'eye' },
	{ label: i18n.t('admin/menu/menu___zoek'), value: 'search' },
];

import { IconName } from '@viaa/avo2-components';

import i18n from '../../../shared/translations/i18n';
import { ReactSelectOption } from '../../../shared/types';

export const ADMIN_ICON_OPTIONS: ReactSelectOption<IconName>[] = [
	{ label: i18n.t('admin/shared/constants/index___afbeelding'), value: 'image' },
	{ label: i18n.t('admin/shared/constants/index___aktetas'), value: 'briefcase' },
	{ label: i18n.t('admin/shared/constants/index___audio'), value: 'headphone' },
	{ label: i18n.t('admin/shared/constants/index___collectie'), value: 'collection' },
	{ label: i18n.t('admin/shared/constants/index___download'), value: 'download' },
	{ label: i18n.t('admin/shared/constants/index___externe-link'), value: 'external-link' },
	{ label: i18n.t('admin/shared/constants/index___help'), value: 'help-circle' },
	{ label: i18n.t('admin/shared/constants/index___info'), value: 'info' },
	{ label: i18n.t('admin/shared/constants/index___kalender'), value: 'calendar' },
	{ label: i18n.t('admin/shared/constants/index___klascement'), value: 'klascement' },
	{ label: i18n.t('admin/shared/constants/index___link'), value: 'link-2' },
	{ label: i18n.t('admin/shared/constants/index___link-delen'), value: 'share-2' },
	{ label: i18n.t('admin/shared/constants/index___login'), value: 'log-in' },
	{ label: i18n.t('admin/shared/constants/index___opdracht'), value: 'clipboard' },
	{ label: i18n.t('admin/shared/constants/index___profiel'), value: 'user' },
	{ label: i18n.t('admin/shared/constants/index___smartschool'), value: 'smartschool' },
	{ label: i18n.t('admin/shared/constants/index___tekstbestand'), value: 'file-text' },
	{ label: i18n.t('admin/shared/constants/index___uploaden'), value: 'upload' },
	{ label: i18n.t('admin/shared/constants/index___video'), value: 'video' },
	{ label: i18n.t('admin/shared/constants/index___view'), value: 'eye' },
	{ label: i18n.t('admin/shared/constants/index___zoek'), value: 'search' },
];

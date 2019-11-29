import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';

const { DANGER } = TOAST_TYPE;

export const isMediaFragment = (fragmentInfo: { external_id: string | undefined }) => {
	return fragmentInfo.external_id && fragmentInfo.external_id !== '-1';
};

export const getFragmentProperty = (
	itemMetaData: Avo.Item.Item,
	fragment: Avo.Collection.Fragment,
	useCustomFields: Boolean,
	prop: 'title' | 'description'
) => {
	return useCustomFields || !itemMetaData
		? get(fragment, `custom_${prop}`, '')
		: get(itemMetaData, prop, '');
};

const getFragmentByPosition = (fragments: Avo.Collection.Fragment[], position: number) => {
	const fragmentAtPosition = fragments.find(
		(fragment: Avo.Collection.Fragment) => fragment.position === position
	);

	if (!fragmentAtPosition) {
		toastService(`Het fragment met positie ${position} is niet gevonden`, DANGER);
		return;
	}

	return fragmentAtPosition;
};

export const swapFragmentsPositions = (
	fragments: Avo.Collection.Fragment[],
	currentFragmentId: number,
	delta: number
) => {
	const currentFragment = getFragmentByPosition(fragments, currentFragmentId);
	const otherFragment = getFragmentByPosition(fragments, currentFragmentId - delta);

	if (currentFragment && otherFragment) {
		currentFragment.position -= delta;
		otherFragment.position += delta;
	}

	return fragments;
};

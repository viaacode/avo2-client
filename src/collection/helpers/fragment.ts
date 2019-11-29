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

/*
[
	FRAGMENT A,
	FRAGMENT B,
]
*/

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

	console.log('FRAGMENTS', fragments);

	console.log('OLD CURRENT FRAGMENT', currentFragment);
	console.log('OLD OTHER FRAGMENT', otherFragment);

	if (currentFragment && otherFragment) {
		console.log('delta', delta);

		currentFragment.position -= delta;
		otherFragment.position += delta;

		console.log('NEW CURRENT FRAGMENT', currentFragment);
		console.log('NEW OTHER FRAGMENT', otherFragment);
	}

	console.log('NEW FRAGMENTS', fragments);

	return fragments;
};

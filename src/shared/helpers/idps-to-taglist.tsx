import React from 'react';

import { TagList, TagOption } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const IDP_COLORS: { [idp in Avo.Auth.IdpType]: string } = {
	HETARCHIEF: '#25a4cf',
	KLASCEMENT: '#f7931b',
	SMARTSCHOOL: '#f05a1a',
};

/* eslint-enable @typescript-eslint/no-unused-vars */

export function idpMapsToTagList(ipdMaps: Avo.Auth.IdpType[]) {
	return (
		<TagList
			tags={ipdMaps.map(
				(idpMap: Avo.Auth.IdpType): TagOption => ({
					color: IDP_COLORS[idpMap],
					label: idpMap,
					id: idpMap,
				})
			)}
		/>
	);
}

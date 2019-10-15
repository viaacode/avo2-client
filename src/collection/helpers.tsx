import { Avatar } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import React, { ReactNode } from 'react';

export const isMediaFragment = (fragmentInfo: { external_id: string | undefined }) => {
	return fragmentInfo.external_id && fragmentInfo.external_id !== '-1';
};

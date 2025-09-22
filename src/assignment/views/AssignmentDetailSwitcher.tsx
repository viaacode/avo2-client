import { Flex, Spacer, Spinner } from '@viaa/avo2-components';
import { useAtomValue } from 'jotai';
import React, { type FC } from 'react';

import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { commonUserAtom } from '../../authentication/authentication.store';
import { ALL_SEARCH_FILTERS } from '../../search/search.const';

import { AssignmentDetail } from './AssignmentDetail';
import { AssignmentResponseEditPage } from './AssignmentResponseEdit/AssignmentResponseEditPage';

import './AssignmentEdit.scss';
import './AssignmentPage.scss';

export const AssignmentDetailSwitcher: FC = () => {
	const commonUser = useAtomValue(commonUserAtom);

	if (!commonUser?.userGroup?.id) {
		return (
			<Spacer margin="top-extra-large">
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			</Spacer>
		);
	}
	if (
		[SpecialUserGroupId.PupilSecondary, SpecialUserGroupId.PupilElementary]
			.map(String)
			.includes(String(commonUser?.userGroup?.id))
	) {
		// Render assignment response edit page
		return <AssignmentResponseEditPage />;
	}
	// Render teacher assignment detail page
	return <AssignmentDetail enabledMetaData={ALL_SEARCH_FILTERS} />;
};

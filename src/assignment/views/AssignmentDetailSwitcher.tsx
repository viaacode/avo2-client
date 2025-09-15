import { Flex, Spacer, Spinner } from '@viaa/avo2-components';
import React, { type FC } from 'react';

import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { ALL_SEARCH_FILTERS } from '../../search/search.const';
import withUser, { type UserProps } from '../../shared/hocs/withUser';

import AssignmentDetail from './AssignmentDetail';
import AssignmentResponseEditPage from './AssignmentResponseEdit/AssignmentResponseEditPage';

import './AssignmentEdit.scss';
import './AssignmentPage.scss';

interface AssignmentEditProps {
	onUpdate: () => void | Promise<void>;
}

const AssignmentDetailSwitcher: FC<UserProps> = ({ commonUser }) => {
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

export default withUser(AssignmentDetailSwitcher) as FC<AssignmentEditProps>;

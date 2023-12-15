import { Flex, Spacer, Spinner } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { ALL_SEARCH_FILTERS } from '../../search/search.const';
import withUser, { UserProps } from '../../shared/hocs/withUser';

import AssignmentDetail from './AssignmentDetail';
import AssignmentResponseEditPage from './AssignmentResponseEdit/AssignmentResponseEditPage';

import './AssignmentEdit.scss';
import './AssignmentPage.scss';

interface AssignmentEditProps extends DefaultSecureRouteProps<{ id: string; tabId: string }> {
	onUpdate: () => void | Promise<void>;
}

const AssignmentDetailSwitcher: FunctionComponent<UserProps> = (props) => {
	if (!props.commonUser?.userGroup?.id) {
		return (
			<Spacer margin="top-extra-large">
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			</Spacer>
		);
	}
	if (props.commonUser?.userGroup?.id === SpecialUserGroup.Pupil) {
		// Render assignment response edit page
		return <AssignmentResponseEditPage />;
	}
	// Render teacher assignment detail page
	return <AssignmentDetail {...props} enabledMetaData={ALL_SEARCH_FILTERS} />;
};

export default withUser(AssignmentDetailSwitcher) as FunctionComponent<AssignmentEditProps>;

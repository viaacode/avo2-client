import {
	Button,
	Column,
	Container,
	Grid,
	Spacer,
	Spinner,
	Toolbar,
	ToolbarCenter,
} from '@viaa/avo2-components';
import { CommonUserSchema } from '@viaa/avo2-types/types/user';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CustomError } from '../../../shared/helpers';
import { tHtml, tText } from '../../../shared/helpers/translate';
import { NotificationService } from '../../../shared/services/notification-service';
import { ToastService } from '../../../shared/services/toast-service';
import { AppState } from '../../../store';
import { acceptConditionsAction } from '../../store/actions';
import { selectLogin } from '../../store/selectors';

export type AcceptElementaryPupilConditionsProps = {
	acceptConditions: () => Dispatch;
	user: CommonUserSchema;
};

export const ACCEPTED_ELEMENTARY_PUPIL_TERMS_OF_USE = 'ACCEPTED_ELEMENTARY_PUPIL_TERMS_OF_USE';

const AcceptElementaryPupilConditions: FunctionComponent<AcceptElementaryPupilConditionsProps> = ({
	user,
	acceptConditions,
}) => {
	const [loading, setLoading] = useState(false);

	const handleAcceptPupilConditions = async () => {
		try {
			setLoading(true);
			await NotificationService.setNotification(
				ACCEPTED_ELEMENTARY_PUPIL_TERMS_OF_USE,
				user.profileId,
				true,
				true
			);

			acceptConditions();
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to set accept conditions notification in the database',
					err,
					{ user }
				)
			);

			ToastService.danger(tHtml('Het opslaan van je voorkeuren is niet gelukt.'));

			setLoading(false); // Disable spinner on error, if success => we redirect to other route
		}
	};

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Grid>
						<Column size="1">Visual landingpage</Column>
					</Grid>
				</Container>
			</Container>
			<Spacer margin="large">
				<Toolbar>
					<ToolbarCenter>
						{loading ? (
							<Spinner size={'large'} />
						) : (
							<Button
								label={tText('TODO')}
								title={tText('TODO')}
								type="primary"
								onClick={handleAcceptPupilConditions}
							/>
						)}
					</ToolbarCenter>
				</Toolbar>
			</Spacer>
		</>
	);
};

const mapStateToProps = (state: AppState) => ({
	loginState: selectLogin(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		acceptConditions: () => dispatch(acceptConditionsAction() as any),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(AcceptElementaryPupilConditions);

import { get } from 'lodash-es';
import React, { FC, useCallback, useEffect } from 'react';
import { compose } from 'react-apollo';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';

import { Button, Modal, ModalBody, Spacer } from '@viaa/avo2-components';

import { SpecialUserGroup } from '../../../admin/user-groups/user-group.const';
import { getProfileId } from '../../../authentication/helpers/get-profile-id';
import { hasIdpLinked, isProfileComplete } from '../../../authentication/helpers/get-profile-info';
import { redirectToServerLinkAccount } from '../../../authentication/helpers/redirects';
import { AppState } from '../../../store';
import { setShowNudgingModalAction } from '../../../uistate/store/actions';
import { selectShowNudgingModal } from '../../../uistate/store/selectors';
import { ROUTE_PARTS } from '../../constants';
import { CustomError } from '../../helpers';
import withUser, { UserProps } from '../../hocs/withUser';
import {
	ProfilePreference,
	ProfilePreferencesService,
} from '../../services/profile-preferences.service';

import './ACMIDMNudgeModal.scss';

export interface ACMIDMNudgeModalProps {}

interface UiStateProps {
	showNudgingModal: boolean;
	setShowNudgingModal: (showModal: boolean) => Dispatch;
}

const ACMIDMNudgeModal: FC<UserProps & UiStateProps & RouteComponentProps> = ({
	location,
	user,
	showNudgingModal,
	setShowNudgingModal,
}) => {
	const [t] = useTranslation();
	const isPupil = get(user, 'profile.userGroupIds[0]') === SpecialUserGroup.Pupil;

	// HTTP

	const fetchProfilePreference = useCallback(async () => {
		if (showNudgingModal !== null) {
			// was already initialized
			return;
		}

		try {
			const profilePreference = await ProfilePreferencesService.fetchProfilePreference(
				getProfileId(user),
				ProfilePreference.DoNotShow
			);

			const hasVlaamseOverheidLinked = !!(user && hasIdpLinked(user, 'VLAAMSEOVERHEID'));
			const profileIsComplete = !!(user && isProfileComplete(user));

			setShowNudgingModal(
				!(profilePreference || []).length && !hasVlaamseOverheidLinked && profileIsComplete
			);
		} catch (err) {
			console.error(new CustomError('Failed to fetch profile preference', err));
		}
	}, [user, showNudgingModal, setShowNudgingModal]);

	const setProfilePreference = async () => {
		try {
			await ProfilePreferencesService.setProfilePreference(
				getProfileId(user),
				ProfilePreference.DoNotShow
			);

			setShowNudgingModal(false);
		} catch (err) {
			console.error(new CustomError('Failed to insert profile preference', err));
		}
	};

	// Lifecycle

	useEffect(() => {
		const isOnAssignmentPage = location.pathname.includes(ROUTE_PARTS.assignments);

		if (user && (!isPupil || (isPupil && !isOnAssignmentPage))) {
			fetchProfilePreference();
		}
	}, [fetchProfilePreference, user, isPupil, location]);

	// Events

	const onClose = () => setShowNudgingModal(false);
	const onClickDoNotShow = setProfilePreference;

	// Render

	const renderTitle = () => {
		return isPupil ? (
			t(
				'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___snel-veilig-en-makkelijk-inloggen'
			)
		) : (
			<>
				{t(
					'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___snel-en-makkelijk-inloggen-met'
				)}
				<span className="u-text-bold">
					{t(
						'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___itsme-e-id-of-een-digitale-sleutel'
					)}
				</span>
				?
			</>
		);
	};

	const renderDescription = () => {
		return isPupil
			? t(
					'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___koppel-dan-snel-je-leerling-id-aan-je-bestaande-account'
			  )
			: t(
					'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___koppel-dan-direct-je-burgerprofiel-aan-je-bestaande-account'
			  );
	};

	const renderOptions = () => {
		return isPupil ? (
			<>
				<Spacer margin="bottom-large">
					<Button
						block
						className="c-button-acmidm"
						type="tertiary"
						icon="leerid"
						label={t(
							'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___leerling-id'
						)}
						onClick={() => {
							redirectToServerLinkAccount(
								location,
								'VLAAMSEOVERHEID',
								'authMech=leerid'
							);
							onClose();
						}}
					/>
				</Spacer>
			</>
		) : (
			<>
				<Spacer margin="bottom-large">
					<Button
						block
						className="c-button-itsme"
						type="tertiary"
						icon="itsme"
						iconType="multicolor"
						label={t('shared/components/acmidm-nudge-modal/acmidm-nudge-modal___itsme')}
						onClick={() => {
							redirectToServerLinkAccount(
								location,
								'VLAAMSEOVERHEID',
								'authMech=itsme'
							);
							onClose();
						}}
					/>
				</Spacer>

				<Spacer margin="bottom-large">
					<Button
						block
						className="c-button-acmidm"
						type="tertiary"
						icon="eid"
						label={t(
							'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___e-id-of-een-digitale-sleutel'
						)}
						onClick={() => {
							redirectToServerLinkAccount(location, 'VLAAMSEOVERHEID', 'authMech');
							onClose();
						}}
					/>
				</Spacer>
			</>
		);
	};

	return (
		<Modal
			isOpen={showNudgingModal}
			size="medium"
			onClose={onClose}
			className="c-nudge-modal__wrapper"
		>
			<ModalBody>
				<div className="c-nudge-modal">
					<p className="c-nudge-modal__title">
						<Spacer margin={['bottom-small']}>{renderTitle()}</Spacer>
					</p>

					<p className="c-nudge-modal__description">
						<Spacer margin={['bottom-large']}>{renderDescription()}</Spacer>
					</p>

					<div className="c-nudge-modal__options">{renderOptions()}</div>

					<Spacer className="c-nudge-modal__footer" margin="none" padding={['top']}>
						<div>
							<Button
								type="link"
								label={t(
									'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___nu-even-niet'
								)}
								onClick={onClose}
							/>
						</div>

						<Button
							type="link"
							label={t(
								'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___niet-meer-weergeven'
							)}
							onClick={onClickDoNotShow}
						/>
					</Spacer>
				</div>
			</ModalBody>
		</Modal>
	);
};

const mapStateToProps = (state: AppState) => ({
	showNudgingModal: selectShowNudgingModal(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
	setShowNudgingModal: (showModal: boolean) =>
		dispatch(setShowNudgingModalAction(showModal) as any),
});

export default compose(
	connect(mapStateToProps, mapDispatchToProps),
	withRouter,
	withUser
)(ACMIDMNudgeModal) as FC;

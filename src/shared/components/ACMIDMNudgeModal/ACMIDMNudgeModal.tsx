import { get } from 'lodash-es';
import React, { FC, useCallback, useEffect } from 'react';
import { compose } from 'react-apollo';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';

import { Button, Column, Grid, Icon, Modal, ModalBody, Spacer } from '@viaa/avo2-components';

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
			<div
				onClick={() => {
					redirectToServerLinkAccount(location, 'VLAAMSEOVERHEID', 'authMech=leerid');
					onClose();
				}}
			>
				<Grid className="c-nudge-modal__options__item">
					<Column
						className="c-nudge-modal__options__column c-nudge-modal__options__column--left"
						size="3-2"
					>
						<Icon name="leerid" size="huge" />
					</Column>
					<Column
						className="c-nudge-modal__options__column c-nudge-modal__options__column--right"
						size="3-10"
					>
						<Spacer>
							{t(
								'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___leerling-id'
							)}
						</Spacer>
					</Column>
				</Grid>
			</div>
		) : (
			<>
				<div
					onClick={() => {
						redirectToServerLinkAccount(location, 'VLAAMSEOVERHEID', 'authMech=itsme');
						onClose();
					}}
				>
					<Grid className="c-nudge-modal__options__item">
						<Column
							className="c-nudge-modal__options__column c-nudge-modal__options__column--left"
							size="3-2"
						>
							<Icon name={'itsme'} size="huge" type="multicolor" />
						</Column>
						<Column
							className="c-nudge-modal__options__column c-nudge-modal__options__column--right"
							size="3-10"
						>
							<Spacer>
								{t(
									'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___itsme'
								)}
							</Spacer>
						</Column>
					</Grid>
				</div>
				<div
					onClick={() => {
						redirectToServerLinkAccount(location, 'VLAAMSEOVERHEID');
						onClose();
					}}
				>
					<Grid className="c-nudge-modal__options__item">
						<Column
							className="c-nudge-modal__options__column c-nudge-modal__options__column--left"
							size="3-2"
						>
							<Icon name={'eid'} size="large" />
						</Column>
						<Column
							className="c-nudge-modal__options__column c-nudge-modal__options__column--right"
							size="3-10"
						>
							<Spacer>
								{t(
									'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___e-id-of-een-digitale-sleutel'
								)}
							</Spacer>
						</Column>
					</Grid>
				</div>
			</>
		);
	};

	return (
		<Modal isOpen={showNudgingModal} size="medium" onClose={onClose}>
			<ModalBody>
				<div className="c-nudge-modal">
					<Spacer margin="bottom"></Spacer>

					<p className="c-nudge-modal__title">{renderTitle()}</p>

					<p className="c-nudge-modal__description">{renderDescription()}</p>

					<div className="c-nudge-modal__options">{renderOptions()}</div>

					<Spacer margin="bottom-small">
						<Button
							type="secondary"
							label={t(
								'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___nu-even-niet'
							)}
							onClick={onClose}
						/>
					</Spacer>

					<Button
						type="secondary"
						label={t(
							'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___niet-meer-weergeven'
						)}
						onClick={onClickDoNotShow}
					/>
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

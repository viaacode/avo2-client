import { Button, IconName, Modal, ModalBody, Spacer } from '@viaa/avo2-components';
import { Idp } from '@viaa/avo2-types';
import { useAtom, useAtomValue } from 'jotai';
import React, { type FC, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { isProfileComplete } from '../../../authentication/helpers/get-profile-info';
import {
	getLoginCounter,
	LOGIN_COUNTER_BEFORE_NUDGING,
} from '../../../authentication/helpers/login-counter-before-nudging';
import { redirectToServerLinkAccount } from '../../../authentication/helpers/redirects';
import { APP_PATH } from '../../../constants';
import { NOT_NOW_LOCAL_STORAGE_KEY, NOT_NOW_VAL, ROUTE_PARTS } from '../../constants';
import { CustomError } from '../../helpers/custom-error';
import { isPupil } from '../../helpers/is-pupil';
import { ProfilePreferencesService } from '../../services/profile-preferences.service';
import { ProfilePreferenceKey } from '../../services/profile-preferences.types';
import { showNudgingModalAtom } from '../../store/ui.store';

import './ACMIDMNudgeModal.scss';
import { tText } from '../../helpers/translate-text';
import { tHtml } from '../../helpers/translate-html';

export const ACMIDMNudgeModal: FC = () => {
	const location = useLocation();

	const commonUser = useAtomValue(commonUserAtom);
	const [showNudgingModal, setShowNudgingModal] = useAtom(showNudgingModalAtom);

	// HTTP

	const setProfilePreference = async () => {
		try {
			if (!commonUser?.profileId) {
				throw new CustomError(
					'Failed to set profile preference because the profile id is missing',
					null,
					{ commonUser }
				);
			}
			await ProfilePreferencesService.setProfilePreference(
				commonUser?.profileId,
				ProfilePreferenceKey.DoNotShow
			);

			setShowNudgingModal(false);
		} catch (err) {
			console.error(new CustomError('Failed to insert profile preference', err));
		}
	};

	// Lifecycle

	const updateShowNudgingModal = useCallback(async () => {
		const hasDismissed = localStorage.getItem(NOT_NOW_LOCAL_STORAGE_KEY) === NOT_NOW_VAL;
		const loginCounter = getLoginCounter();

		// Stop early if previously dismissed
		// Or if user is logging out https://meemoo.atlassian.net/browse/ARC-1731
		if (
			hasDismissed ||
			!commonUser ||
			!commonUser.profileId ||
			window.location.href.includes(ROUTE_PARTS.logout)
		) {
			setShowNudgingModal(false);
			return;
		}

		const isOnAssignmentPage = location.pathname.includes(ROUTE_PARTS.assignments);
		const isOnAccountLinkingPage = location.pathname.includes(APP_PATH.SETTINGS_LINKS.route);
		const isUserAPupil = isPupil(commonUser.userGroup?.id);
		const didUserLoginEnoughTimesBeforeNudging = loginCounter >= LOGIN_COUNTER_BEFORE_NUDGING;

		if (
			didUserLoginEnoughTimesBeforeNudging &&
			commonUser &&
			!isOnAccountLinkingPage &&
			(!isUserAPupil || (isUserAPupil && !isOnAssignmentPage))
		) {
			const profilePreferences =
				(await ProfilePreferencesService.fetchProfilePreference(
					commonUser.profileId,
					ProfilePreferenceKey.DoNotShow
				)) || [];

			const hasVlaamseOverheidLinked =
				!!commonUser &&
				(!!commonUser.idps?.[Idp.VLAAMSEOVERHEID__SUB_ID] ||
					!!commonUser.idps?.[Idp.VLAAMSEOVERHEID__ACCOUNT_ID]);
			const profileIsComplete = commonUser && isProfileComplete(commonUser);

			setShowNudgingModal(
				!profilePreferences.length && !hasVlaamseOverheidLinked && profileIsComplete
			);
		} else {
			setShowNudgingModal(false);
		}
	}, [commonUser, location, setShowNudgingModal]);

	useEffect(() => {
		updateShowNudgingModal();
	}, [updateShowNudgingModal]);

	// Events

	const onClose = () => {
		setShowNudgingModal(false);
		localStorage.setItem(NOT_NOW_LOCAL_STORAGE_KEY, NOT_NOW_VAL);
	};

	const onClickDoNotShow = setProfilePreference;

	// Render

	const renderTitle = () => {
		return isPupil(commonUser?.userGroup?.id) ? (
			tText(
				'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___snel-veilig-en-makkelijk-inloggen'
			)
		) : (
			<>
				{tHtml(
					'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___snel-en-makkelijk-inloggen-met'
				)}
				<span className="u-text-bold">
					{tHtml(
						'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___itsme-e-id-of-een-digitale-sleutel'
					)}
				</span>
				?
			</>
		);
	};

	const renderDescription = () => {
		return isPupil(commonUser?.userGroup?.id)
			? tHtml(
					'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___koppel-dan-snel-je-leerling-id-aan-je-bestaande-account'
			  )
			: tHtml(
					'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___koppel-dan-direct-je-burgerprofiel-aan-je-bestaande-account'
			  );
	};

	const renderOptions = () => {
		return isPupil(commonUser?.userGroup?.id) ? (
			<>
				<Spacer margin="bottom-large">
					<Button
						block
						className="c-button-leerid"
						type="tertiary"
						icon={IconName.leerid}
						iconType="custom"
						label={tText(
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
						icon={IconName.itsme}
						iconType="multicolor"
						label={tText(
							'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___itsme'
						)}
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
						icon={IconName.eid}
						label={tText(
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
					<Spacer className="c-nudge-modal__title" margin={['bottom-small']}>
						<p>{renderTitle()}</p>
					</Spacer>

					<Spacer className="c-nudge-modal__description" margin={['bottom-large']}>
						<p>{renderDescription()}</p>
					</Spacer>

					<div className="c-nudge-modal__options">{renderOptions()}</div>

					<Spacer className="c-nudge-modal__footer" margin="none" padding={['top']}>
						<div>
							<Button
								type="link"
								label={tText(
									'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___nu-even-niet'
								)}
								onClick={onClose}
							/>
						</div>

						<Button
							type="link"
							label={tText(
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

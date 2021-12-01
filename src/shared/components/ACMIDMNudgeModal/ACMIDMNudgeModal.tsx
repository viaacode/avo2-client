import { get } from 'lodash-es';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { compose } from 'react-apollo';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {
	Button,
	Column,
	Grid,
	Icon,
	IconName,
	Modal,
	ModalBody,
	Spacer,
} from '@viaa/avo2-components';

import { SpecialUserGroup } from '../../../admin/user-groups/user-group.const';
import { getProfileId } from '../../../authentication/helpers/get-profile-id';
import { hasIdpLinked } from '../../../authentication/helpers/get-profile-info';
import { redirectToServerLinkAccount } from '../../../authentication/helpers/redirects';
import { CustomError } from '../../helpers';
import withUser, { UserProps } from '../../hocs/withUser';
import {
	ProfilePreference,
	ProfilePreferencesService,
} from '../../services/profile-preferences.service';

import './ACMIDMNudgeModal.scss';

export interface ACMIDMNudgeModalProps {}

const ACMIDMNudgeModal: FC<UserProps & RouteComponentProps> = ({ location, user }) => {
	const [t] = useTranslation();

	const [showModal, setShowModal] = useState<boolean>(false);
	// const [t] = useTranslation();

	const fetchProfilePreference = useCallback(async () => {
		try {
			const profilePreference = await ProfilePreferencesService.fetchProfilePreference(
				getProfileId(user),
				ProfilePreference.DoNotShow
			);
			const hasVlaamseOverheidLinked = user && hasIdpLinked(user, 'VLAAMSEOVERHEID');

			setShowModal(!(profilePreference || []).length && !hasVlaamseOverheidLinked);
		} catch (err) {
			console.error(new CustomError('Failed to fetch profile preference', err));
		}
	}, [user]);

	const setProfilePreference = async () => {
		try {
			await ProfilePreferencesService.setProfilePreference(
				getProfileId(user),
				ProfilePreference.DoNotShow
			);

			setShowModal(false);
		} catch (err) {
			console.error(new CustomError('Failed to insert profile preference', err));
		}
	};

	useEffect(() => {
		const isPupil = get(user, 'profile.userGroupIds[0]') === SpecialUserGroup.Pupil;

		if (user && !isPupil) {
			fetchProfilePreference();
		}
	}, [fetchProfilePreference, user]);

	const onClose = () => setShowModal(false);
	const onClickDoNotShow = () => {
		setProfilePreference();
	};

	return (
		<Modal isOpen={showModal} size="medium" onClose={onClose}>
			<ModalBody>
				<div className="c-nudge-modal">
					<Spacer margin="bottom">
						<p className="c-nudge-modal__title">
							{t(
								'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___snel-en-makkelijk-inloggen-met'
							)}
							<span className="u-text-bold">
								{t(
									'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___itsme-e-id-of-een-digitale-sleutel'
								)}
							</span>
							?
						</p>
					</Spacer>
					<p className="c-nudge-modal__description">
						{t(
							'shared/components/acmidm-nudge-modal/acmidm-nudge-modal___koppel-dan-direct-je-burgerprofiel-aan-je-bestaande-account'
						)}
					</p>
					<div className="c-nudge-modal__options">
						<div
							onClick={() => {
								redirectToServerLinkAccount(
									location,
									'VLAAMSEOVERHEID',
									'itsme=true'
								);
								onClose();
							}}
						>
							<Grid className="c-nudge-modal__options__item">
								<Column
									className="c-nudge-modal__options__column c-nudge-modal__options__column--left"
									size="3-2"
								>
									<Icon
										name={'itsme' as IconName}
										size="huge"
										type="multicolor"
									/>
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
									<Icon name={'eid' as IconName} size="large" />
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
					</div>
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

export default compose(withRouter, withUser)(ACMIDMNudgeModal) as FC;

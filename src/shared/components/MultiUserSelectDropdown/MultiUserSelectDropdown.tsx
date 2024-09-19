import {
	Button,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Icon,
	IconName,
	Spacer,
	TagList,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import { uniqBy } from 'lodash-es';
import React, {
	type FunctionComponent,
	type ReactText,
	useCallback,
	useEffect,
	useState,
} from 'react';

import { ContentPicker } from '../../../admin/shared/components/ContentPicker/ContentPicker';
import { type PickerItem } from '../../../admin/shared/types';
import useTranslation from '../../../shared/hooks/useTranslation';
import { CustomError } from '../../helpers';
import { ToastService } from '../../services/toast-service';

import './MultiUserSelectDropdown.scss';

export interface MultiUserSelectDropdownProps {
	label: string;
	id: string;
	values: string[];
	disabled?: boolean;
	placeholder?: string;
	onChange: (profileIds: string[], id: string) => void;
	showSelectedValuesOnCollapsed?: boolean;
}

export const MultiUserSelectDropdown: FunctionComponent<MultiUserSelectDropdownProps> = ({
	label,
	id,
	values,
	disabled,
	placeholder,
	onChange,
	showSelectedValuesOnCollapsed = true,
}) => {
	const { tText, tHtml } = useTranslation();

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedProfiles, setSelectedProfiles] = useState<PickerItem[]>([]);
	const [selectedProfile, setSelectedProfile] = useState<PickerItem | undefined>(undefined);

	const getProfilesByName = useCallback(async () => {
		try {
			const { UserService } = await import('@meemoo/admin-core-ui/dist/admin.mjs');
			const users: Partial<Avo.User.CommonUser>[] =
				await UserService.getNamesByProfileIds(values);

			setSelectedProfiles(
				users.map(
					(user): PickerItem => ({
						label: `${user?.fullName} (${user?.email})`,
						value: user.profileId || '',
						type: 'PROFILE',
					})
				)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch profile name info for profile ids', err, {
					values,
				})
			);
			ToastService.danger(
				tHtml(
					'shared/components/multi-user-select-dropdown/multi-user-select-dropdown___het-ophalen-van-de-gebruikersaccount-namen-is-mislukt'
				)
			);
		}
	}, [tHtml, values]);

	useEffect(() => {
		if (selectedProfile) {
			setSelectedProfile(undefined);
		}
	}, [selectedProfile, setSelectedProfile]);

	useEffect(() => {
		if (values.length) {
			getProfilesByName();
		}
	}, [values, setSelectedProfiles, tHtml]);

	const closeDropdown = () => {
		setSelectedProfiles([]);
		setIsOpen(false);
	};

	const applyFilter = () => {
		onChange(
			selectedProfiles.map((profile) => profile.value),
			id
		);
		closeDropdown();
	};

	const removeProfile = (tagId: ReactText) => {
		setSelectedProfiles((selectedProfiles) =>
			selectedProfiles.filter((profile) => profile.value !== tagId)
		);
	};

	const deleteAllSelectedProfiles = () => {
		setSelectedProfiles([]);
		onChange([], id);
	};

	const renderCheckboxControl = () => {
		return (
			<Dropdown
				label={label}
				menuClassName="c-user-dropdown__menu"
				isOpen={isOpen}
				onOpen={() => setIsOpen(true)}
				onClose={closeDropdown}
			>
				<DropdownButton>
					<Button
						autoHeight
						className="c-checkbox-dropdown-modal__trigger"
						type="secondary"
					>
						<div className="c-button__content">
							<div className="c-button__label">{label}</div>
							{!!selectedProfiles.length && showSelectedValuesOnCollapsed && (
								<TagList
									tags={[
										{
											id: 'users',
											label: `${selectedProfiles.length} ${
												selectedProfiles.length > 1
													? tText(
															'shared/components/multi-user-select-dropdown/multi-user-select-dropdown___gebruikers'
													  )
													: tText(
															'shared/components/multi-user-select-dropdown/multi-user-select-dropdown___gebruiker'
													  )
											}`,
										},
									]}
									swatches={false}
									closable
									onTagClosed={deleteAllSelectedProfiles}
								/>
							)}
							<Icon
								className="c-button__icon"
								name={isOpen ? IconName.caretUp : IconName.caretDown}
								size="small"
								type="arrows"
							/>
						</div>
					</Button>
				</DropdownButton>
				<DropdownContent>
					<Spacer>
						<Form>
							{!!selectedProfiles.length && showSelectedValuesOnCollapsed && (
								<TagList
									tags={selectedProfiles.map((profile) => ({
										label: profile.label || profile.value,
										id: profile.value,
									}))}
									swatches={false}
									closable
									onTagClosed={removeProfile}
								/>
							)}
							<Spacer margin={['top', 'bottom']}>
								<div key={`profile-content-picker-${selectedProfile?.label}`}>
									<ContentPicker
										onSelect={(selectedProfile) => {
											if (selectedProfile) {
												setSelectedProfiles((selectedProfiles) =>
													uniqBy(
														[...selectedProfiles, selectedProfile],
														'value'
													)
												);
												setSelectedProfile(selectedProfile);
											}
										}}
										hideTargetSwitch
										allowedTypes={['PROFILE']}
										hideTypeDropdown
										placeholder={
											placeholder ||
											tText(
												'shared/components/multi-user-select-dropdown/multi-user-select-dropdown___selecteer-een-gebruiker'
											)
										}
										initialValue={selectedProfile}
									/>
								</div>
							</Spacer>

							<FormGroup>
								<Button
									label={tText(
										'shared/components/checkbox-dropdown-modal/checkbox-dropdown-modal___toepassen'
									)}
									type="primary"
									className="c-apply-filter-button"
									block
									onClick={applyFilter}
								/>
							</FormGroup>
						</Form>
					</Spacer>
				</DropdownContent>
			</Dropdown>
		);
	};

	if (disabled) {
		return (
			<div className={classnames({ 'u-opacity-50 u-disable-click': disabled })}>
				{renderCheckboxControl()}
			</div>
		);
	}

	return renderCheckboxControl();
};

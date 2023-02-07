import { ColorOption } from '@meemoo/admin-core-ui';
import {
	Button,
	ButtonToolbar,
	IconName,
	Modal,
	ModalBody,
	ModalFooterRight,
	Spacer,
	Spinner,
	Table,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { compact, get, intersection, sortBy, without } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { ColorSelect } from '../../../admin/content-page/components/ColorSelect/ColorSelect';
import { CustomError } from '../../../shared/helpers';
import { generateRandomId } from '../../../shared/helpers/uuid';
import { UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { AssignmentLabelsService } from '../../../shared/services/assignment-labels-service';
import { ToastService } from '../../../shared/services/toast-service';
import { Assignment_Label_v2, AssignmentLabelColor } from '../../assignment.types';

import './ManageAssignmentLabels.scss';

import { getManageAssignmentLabelsTranslations } from './ManageAssignmentLabels.translations';

export interface ManageAssignmentLabelsProps extends UserProps {
	isOpen: boolean;
	onClose: () => void;
	type?: Avo.Assignment.LabelType;
}

const ManageAssignmentLabels: FunctionComponent<ManageAssignmentLabelsProps> = ({
	isOpen,
	onClose,
	type,
	user,
}) => {
	const { tText, tHtml } = useTranslation();
	const translations = getManageAssignmentLabelsTranslations(tText, type);

	const [assignmentLabels, setAssignmentLabels] = useState<Assignment_Label_v2[]>([]);
	const [initialAssignmentLabels, setInitialAssignmentLabels] = useState<Assignment_Label_v2[]>(
		[]
	);
	const [assignmentLabelColors, setAssignmentLabelColors] = useState<AssignmentLabelColor[]>([]);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const fetchAssignmentLabels = useCallback(async () => {
		try {
			if (user?.profile?.id) {
				const labels = sortBy(
					await AssignmentLabelsService.getLabelsForProfile(user.profile.id, type),
					'label'
				);
				setAssignmentLabels(labels);
				setInitialAssignmentLabels(labels);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch assignment labels for user', err, { user })
			);
			ToastService.danger(
				tHtml(
					'assignment/components/modals/manage-assignment-labels___het-ophalen-van-je-labels-is-mislukt'
				)
			);
		}
	}, [user, setAssignmentLabels, tText, type]);

	const fetchAssignmentColors = useCallback(async () => {
		try {
			setAssignmentLabelColors(await AssignmentLabelsService.getLabelColors());
		} catch (err) {
			console.error(new CustomError('Failed to fetch assignment label colors', err));
			ToastService.danger(
				tHtml(
					'assignment/components/modals/manage-assignment-labels___het-ophalen-van-je-label-kleuren-is-mislukt'
				)
			);
		}
	}, [setAssignmentLabelColors, tText]);

	useEffect(() => {
		if (isOpen) {
			// Fetch labels and colors when modal opens
			fetchAssignmentLabels();
			fetchAssignmentColors();
		}
	}, [fetchAssignmentLabels, fetchAssignmentColors, isOpen]);

	const handleAddLabelClick = () => {
		setAssignmentLabels([
			...assignmentLabels,
			{
				id: generateRandomId(),
				label: '',
				color_enum_value: assignmentLabelColors[0].value,
				owner_profile_id: get(user, 'profile.id'),
				color_override: null,
				enum_color: assignmentLabelColors[0],
				type: type || 'LABEL',
			},
		]);
	};

	const handleRowColorChanged = (
		assignmentLabel: Assignment_Label_v2,
		newColor?: ColorOption
	) => {
		if (!newColor) {
			return;
		}
		assignmentLabel.color_enum_value = (newColor as AssignmentLabelColor).value;
		setAssignmentLabels([...assignmentLabels]);
	};

	const handleRowLabelChanged = (assignmentLabel: Assignment_Label_v2, newLabel: string) => {
		assignmentLabel.label = newLabel;
		setAssignmentLabels([...assignmentLabels]);
	};

	const handleRowDelete = (id: string) => {
		setAssignmentLabels([...assignmentLabels.filter((labelObj) => labelObj.id !== id)]);
	};

	const handleSaveLabels = async () => {
		try {
			setIsProcessing(true);
			const initialAssignmentLabelIds = initialAssignmentLabels.map((l) => l.id);
			const updatedAssignmentLabelIds = assignmentLabels.map((l) => l.id);

			const newIds = without(updatedAssignmentLabelIds, ...initialAssignmentLabelIds);
			const oldIds = without(initialAssignmentLabelIds, ...updatedAssignmentLabelIds);
			const updatedIds = intersection(initialAssignmentLabelIds, updatedAssignmentLabelIds);

			const newLabels = compact(
				newIds.map((newId) => assignmentLabels.find((l) => l.id === newId))
			);
			const updatedLabels = compact(
				updatedIds.map((updatedId) => assignmentLabels.find((l) => l.id === updatedId))
			);

			const profileId = user?.profile?.id;
			await Promise.all([
				AssignmentLabelsService.insertLabels(
					newLabels.map((item) =>
						type
							? {
									...item,
									type,
							  }
							: item
					)
				),
				...(profileId
					? [
							AssignmentLabelsService.deleteLabels(profileId, oldIds),
							updatedLabels.map((l) =>
								AssignmentLabelsService.updateLabel(
									profileId,
									l.id,
									l.label || '',
									l.color_enum_value
								)
							),
					  ]
					: []),
			]);
			onClose();
			ToastService.success(
				tHtml(
					'assignment/components/modals/manage-assignment-labels___de-labels-zijn-opgeslagen'
				)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to save label changes', err, {
					initialAssignmentLabels,
					assignmentLabels,
				})
			);
			ToastService.danger(
				tHtml(
					'assignment/components/modals/manage-assignment-labels___het-opslaan-van-de-labels-is-mislukt'
				)
			);
		}
		setIsProcessing(false);
	};

	const renderCell = (rowData: any, columnId: string) => {
		const assignmentLabel = rowData as Assignment_Label_v2;
		const colorOptions: ColorOption[] = assignmentLabelColors.map((assignmentLabelColor) => ({
			label: '',
			value: assignmentLabelColor.value,
			color: assignmentLabelColor.label,
		}));
		switch (columnId) {
			case 'color':
				return (
					<Spacer margin="right-small">
						<ColorSelect
							options={colorOptions}
							value={colorOptions.find(
								(colorOption) =>
									colorOption.value === assignmentLabel.color_enum_value
							)}
							onChange={(newColor) =>
								handleRowColorChanged(assignmentLabel, newColor as ColorOption)
							}
						/>
					</Spacer>
				);

			case 'label':
				return (
					<Spacer margin="right-small">
						<TextInput
							value={assignmentLabel.label || ''}
							onChange={(newLabel) =>
								handleRowLabelChanged(assignmentLabel, newLabel)
							}
						/>
					</Spacer>
				);

			case 'actions':
				return (
					<Button
						ariaLabel={tText(
							'assignment/components/modals/manage-assignment-labels___verwijder-dit-label'
						)}
						title={tText(
							'assignment/components/modals/manage-assignment-labels___verwijder-dit-label'
						)}
						onClick={() => handleRowDelete(assignmentLabel.id)}
						type="danger-hover"
						icon={IconName.delete}
					/>
				);
		}
	};

	return (
		<Modal
			className="m-manage-assignment-labels"
			title={translations.modal.title}
			size="large"
			isOpen={isOpen}
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				<Spacer margin="bottom-large">
					<Button
						label={translations.buttons.addLabel}
						icon={IconName.plus}
						onClick={handleAddLabelClick}
						type="secondary"
					/>
				</Spacer>
				<Table
					columns={[
						{
							label: translations.columns.color,
							id: 'color',
							col: '2',
						},
						{
							label: translations.columns.type,
							id: 'label',
						},
						{ label: '', id: 'actions' },
					]}
					emptyStateMessage={translations.emptyState}
					data={assignmentLabels}
					renderCell={renderCell}
					rowKey="id"
				/>
			</ModalBody>
			<ModalFooterRight>
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								{isProcessing && <Spinner />}
								<Button
									label={tText(
										'assignment/components/modals/manage-assignment-labels___annuleren'
									)}
									type="secondary"
									block
									onClick={onClose}
									disabled={isProcessing}
								/>
								<Button
									label={tText(
										'assignment/components/modals/manage-assignment-labels___opslaan'
									)}
									type="primary"
									block
									disabled={isProcessing}
									onClick={handleSaveLabels}
								/>
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalFooterRight>
		</Modal>
	);
};

export default ManageAssignmentLabels;

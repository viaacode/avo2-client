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
import classnames from 'classnames';
import { compact, intersection, sortBy, without } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { ColorSelect } from '../../../admin/content-page/components/ColorSelect/ColorSelect';
import { Lookup_Enum_Colors_Enum } from '../../../shared/generated/graphql-db-types';
import { CustomError } from '../../../shared/helpers';
import { generateRandomId } from '../../../shared/helpers/uuid';
import useTranslation from '../../../shared/hooks/useTranslation';
import { AssignmentLabelsService } from '../../../shared/services/assignment-labels-service/assignment-labels.service';
import { ToastService } from '../../../shared/services/toast-service';
import { MAX_LABEL_LENGTH } from '../../assignment.const';
import { AssignmentLabelColor } from '../../assignment.types';

import './ManageAssignmentLabels.scss';

import { getManageAssignmentLabelsTranslations } from './ManageAssignmentLabels.translations';

export interface ManageAssignmentLabelsProps {
	isOpen: boolean;
	onClose: () => void;
	type?: Avo.Assignment.LabelType;
	commonUser?: Avo.User.CommonUser;
}

const ManageAssignmentLabels: FunctionComponent<ManageAssignmentLabelsProps> = ({
	isOpen,
	onClose,
	type,
	commonUser,
}) => {
	const { tText, tHtml } = useTranslation();
	const translations = getManageAssignmentLabelsTranslations(tText, type);

	const [assignmentLabels, setAssignmentLabels] = useState<Avo.Assignment.Label[]>([]);
	const [initialAssignmentLabels, setInitialAssignmentLabels] = useState<Avo.Assignment.Label[]>(
		[]
	);
	const [assignmentLabelColors, setAssignmentLabelColors] = useState<AssignmentLabelColor[]>([]);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const profileId = commonUser?.profileId;

	const fetchAssignmentLabels = useCallback(async () => {
		try {
			if (profileId) {
				const labels = sortBy(
					await AssignmentLabelsService.getLabelsForProfile(profileId, type),
					'label'
				);
				setAssignmentLabels(labels);
				setInitialAssignmentLabels(labels);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch assignment labels for user', err, { commonUser })
			);
			ToastService.danger(
				tHtml(
					'assignment/components/modals/manage-assignment-labels___het-ophalen-van-je-labels-is-mislukt'
				)
			);
		}
	}, [commonUser, setAssignmentLabels, tText, type]);

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
				owner_profile_id: profileId as string,
				color_override: null,
				enum_color: assignmentLabelColors[0],
				type: type || 'LABEL',
			},
		]);
	};

	const handleRowColorChanged = (
		assignmentLabel: Avo.Assignment.Label,
		newColor?: ColorOption
	) => {
		if (!newColor) {
			return;
		}
		assignmentLabel.color_enum_value = (newColor as AssignmentLabelColor).value;
		setAssignmentLabels([...assignmentLabels]);
	};

	const handleRowLabelChanged = (assignmentLabel: Avo.Assignment.Label, newLabel: string) => {
		assignmentLabel.label = newLabel;
		setAssignmentLabels([...assignmentLabels]);
	};

	const handleRowDelete = (id: string) => {
		setAssignmentLabels([...assignmentLabels.filter((labelObj) => labelObj.id !== id)]);
	};

	const labelsExceedMaxLength = (labels: Avo.Assignment.Label[]) => {
		return !labels.find((label) => (label.label?.length || 0) > MAX_LABEL_LENGTH);
	};

	const handleSaveLabels = async () => {
		try {
			setIsProcessing(true);
			const initialAssignmentLabelIds = initialAssignmentLabels.map((l) => l.id);
			const updatedAssignmentLabelIds = assignmentLabels.map((l) => l.id);

			if (!labelsExceedMaxLength(assignmentLabels)) {
				ToastService.danger(
					tHtml(
						'assignment/components/modals/manage-assignment-labels___een-of-meerdere-labels-is-langer-dan-max-length-karakters',
						{
							maxLength: MAX_LABEL_LENGTH,
						}
					)
				);
				setIsProcessing(false);
				return;
			}

			const newIds = without(updatedAssignmentLabelIds, ...initialAssignmentLabelIds);
			const oldIds = without(initialAssignmentLabelIds, ...updatedAssignmentLabelIds);
			const updatedIds = intersection(initialAssignmentLabelIds, updatedAssignmentLabelIds);

			const newLabels = compact(
				newIds.map((newId) => assignmentLabels.find((l) => l.id === newId))
			);
			const updatedLabels = compact(
				updatedIds.map((updatedId) => assignmentLabels.find((l) => l.id === updatedId))
			);

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
									l.color_enum_value as Lookup_Enum_Colors_Enum
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
		const assignmentLabel = rowData as Avo.Assignment.Label;
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

						<label
							className={classnames('c-max-length', {
								'c-max-length--invalid':
									(assignmentLabel.label?.length || 0) > MAX_LABEL_LENGTH,
							})}
						>
							{`${assignmentLabel.label?.length || 0}/${MAX_LABEL_LENGTH}`}
						</label>
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
			title={tHtml(translations.modal.title)}
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

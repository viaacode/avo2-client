import { type ColorOption } from '@meemoo/admin-core-ui/dist/admin.mjs';
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
import { type Avo } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { compact, intersection, sortBy, without } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';

import { ColorSelect } from '../../../shared/components/ColorSelect/ColorSelect';
import { CustomError } from '../../../shared/helpers/custom-error';
import { ACTIONS_TABLE_COLUMN_ID } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { generateRandomId } from '../../../shared/helpers/uuid';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { LabelsClassesService } from '../../services/labels-classes';

import { getManageAssignmentLabelsTranslations } from './ManageLabelsClasses.translations';
import { MAX_LABEL_LENGTH } from './labels-classes.const';

import './ManageLabelsClasses.scss';

export interface ManageLabelsAndClassesProps {
	onClose: () => void;
	type?: Avo.LabelClass.Type;
}

const ManageLabelsClasses: FC<ManageLabelsAndClassesProps & UserProps> = ({
	onClose,
	type,
	commonUser,
}) => {
	const { tText, tHtml } = useTranslation();

	const [labels, setLabels] = useState<Avo.LabelClass.LabelClass[]>([]);
	const [initialLabels, setInitialLabels] = useState<Avo.LabelClass.LabelClass[]>([]);
	const [labelColors, setLabelColors] = useState<Avo.LabelClass.LabelClassColor[]>([]);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = useState<boolean>(false);

	const profileId = commonUser?.profileId;

	const fetchAssignmentLabels = useCallback(async () => {
		try {
			if (profileId) {
				const labels = sortBy(
					await LabelsClassesService.getLabelsForProfile(type),
					'label'
				);
				setLabels(labels);
				setInitialLabels(labels);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch assignment labels for user', err, { profileId })
			);
			ToastService.danger(
				tHtml(
					'assignment/components/modals/manage-assignment-labels___het-ophalen-van-je-labels-is-mislukt'
				)
			);
		}
	}, [profileId, type, tHtml]);

	const fetchAssignmentColors = useCallback(async () => {
		try {
			setLabelColors(await LabelsClassesService.getLabelColors());
		} catch (err) {
			console.error(new CustomError('Failed to fetch assignment label colors', err));
			ToastService.danger(
				tHtml(
					'assignment/components/modals/manage-assignment-labels___het-ophalen-van-je-label-kleuren-is-mislukt'
				)
			);
		}
	}, [setLabelColors, tHtml]);

	useEffect(() => {
		if (isManageLabelsModalOpen) {
			// Fetch labels and colors when modal opens
			fetchAssignmentLabels();
			fetchAssignmentColors();
		}
	}, [fetchAssignmentLabels, fetchAssignmentColors, isManageLabelsModalOpen]);

	const handleOnClose = () => {
		setIsManageLabelsModalOpen(false);
		onClose();
	};

	const handleAddLabelClick = () => {
		setLabels([
			...labels,
			{
				id: generateRandomId(),
				label: '',
				color_enum_value: labelColors[0].value,
				owner_profile_id: profileId as string,
				color_override: null,
				enum_color: labelColors[0],
				type: type || 'LABEL',
			},
		]);
	};

	const handleRowColorChanged = (
		assignmentLabel: Avo.LabelClass.LabelClass,
		newColor?: ColorOption
	) => {
		if (!newColor) {
			return;
		}
		assignmentLabel.color_enum_value = (newColor as Avo.LabelClass.LabelClassColor).value;
		setLabels([...labels]);
	};

	const handleRowLabelChanged = (
		assignmentLabel: Avo.LabelClass.LabelClass,
		newLabel: string
	) => {
		assignmentLabel.label = newLabel;
		setLabels([...labels]);
	};

	const handleRowDelete = (id: string) => {
		setLabels([...labels.filter((labelObj) => labelObj.id !== id)]);
	};

	const labelsExceedMaxLength = (labels: Avo.LabelClass.LabelClass[]) => {
		return !labels.find((label) => (label.label?.length || 0) > MAX_LABEL_LENGTH);
	};

	const handleSaveLabels = async () => {
		try {
			setIsProcessing(true);
			const initialAssignmentLabelIds = initialLabels.map((l) => l.id);
			const updatedAssignmentLabelIds = labels.map((l) => l.id);

			if (!labelsExceedMaxLength(labels)) {
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

			const newLabels = compact(newIds.map((newId) => labels.find((l) => l.id === newId)));
			const updatedLabels = compact(
				updatedIds.map((updatedId) => labels.find((l) => l.id === updatedId))
			);

			await Promise.all([
				LabelsClassesService.insertLabels(
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
							LabelsClassesService.deleteLabels(oldIds),
							updatedLabels.map((l) =>
								LabelsClassesService.updateLabel(l.id, {
									label: l.label || '',
									value: l.color_enum_value,
								})
							),
					  ]
					: []),
			]);
			handleOnClose();
			ToastService.success(
				type === 'LABEL'
					? tHtml(
							'assignment/components/modals/manage-assignment-labels___de-nieuwe-labels-zijn-opgeslagen'
					  )
					: tHtml(
							'assignment/components/modals/manage-assignment-labels___de-nieuwe-klassen-zijn-opgeslagen'
					  )
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to save label changes', err, {
					initialAssignmentLabels: initialLabels,
					assignmentLabels: labels,
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
		const assignmentLabel = rowData as Avo.LabelClass.LabelClass;
		const colorOptions: ColorOption[] = labelColors.map((assignmentLabelColor) => ({
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
							className={clsx('c-max-length', {
								'c-max-length--invalid':
									(assignmentLabel.label?.length || 0) > MAX_LABEL_LENGTH,
							})}
						>
							{`${assignmentLabel.label?.length || 0}/${MAX_LABEL_LENGTH}`}
						</label>
					</Spacer>
				);

			case ACTIONS_TABLE_COLUMN_ID:
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

	const tooltip =
		type === 'LABEL'
			? tText('assignment/components/assignment-labels___beheer-je-labels')
			: tText('assignment/components/assignment-labels___beheer-je-klassen');

	return (
		<>
			<Button
				icon={IconName.settings}
				title={tooltip}
				ariaLabel={tooltip}
				type="borderless"
				size="large"
				className="c-button__labels"
				onClick={() => setIsManageLabelsModalOpen(true)}
			/>
			<Modal
				className="m-manage-labels-and-classes"
				title={getManageAssignmentLabelsTranslations(type).modal.title}
				size="large"
				isOpen={isManageLabelsModalOpen}
				onClose={handleOnClose}
				scrollable
			>
				<ModalBody>
					<Spacer margin="bottom-large">
						<Button
							label={getManageAssignmentLabelsTranslations(type).buttons.addLabel}
							icon={IconName.plus}
							onClick={handleAddLabelClick}
							type="secondary"
						/>
					</Spacer>
					<Table
						columns={[
							{
								label: getManageAssignmentLabelsTranslations(type).columns.color,
								id: 'color',
								col: '2',
							},
							{
								label: getManageAssignmentLabelsTranslations(type).columns.type,
								id: 'label',
							},
							{ label: '', id: ACTIONS_TABLE_COLUMN_ID },
						]}
						emptyStateMessage={getManageAssignmentLabelsTranslations(type).emptyState}
						data={labels}
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
		</>
	);
};

export default withUser(ManageLabelsClasses) as FC<ManageLabelsAndClassesProps>;

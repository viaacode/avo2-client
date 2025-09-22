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

import { getManageLabelsTranslations } from './ManageLabelsClasses.translations';
import { MAX_LABEL_LENGTH } from './labels-classes.const';

import './ManageLabelsClasses.scss';

export interface ManageLabelsAndClassesProps {
	onClose: () => void;
	type?: Avo.LabelOrClass.Type;
}

const ManageLabelsClasses: FC<ManageLabelsAndClassesProps & UserProps> = ({
	onClose,
	type,
	commonUser,
}) => {
	const { tText, tHtml } = useTranslation();

	const [labels, setLabels] = useState<Avo.LabelOrClass.LabelOrClass[]>([]);
	const [initialLabels, setInitialLabels] = useState<Avo.LabelOrClass.LabelOrClass[]>([]);
	const [labelColors, setLabelColors] = useState<Avo.LabelOrClass.Color[]>([]);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = useState<boolean>(false);

	const profileId = commonUser?.profileId;

	const fetchLabels = useCallback(async () => {
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
			console.error(new CustomError('Failed to fetch labels for user', err, { profileId }));
			ToastService.danger(tHtml('Het ophalen van je labels is mislukt'));
		}
	}, [profileId, type, tHtml]);

	const fetchLabelColors = useCallback(async () => {
		try {
			setLabelColors(await LabelsClassesService.getLabelColors());
		} catch (err) {
			console.error(new CustomError('Failed to fetch label colors', err));
			ToastService.danger(tHtml('Het ophalen van je label kleuren is mislukt'));
		}
	}, [setLabelColors, tHtml]);

	useEffect(() => {
		if (isManageLabelsModalOpen) {
			// Fetch labels and colors when modal opens
			fetchLabels();
			fetchLabelColors();
		}
	}, [fetchLabels, fetchLabelColors, isManageLabelsModalOpen]);

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
		label: Avo.LabelOrClass.LabelOrClass,
		newColor?: ColorOption
	) => {
		if (!newColor) {
			return;
		}
		label.color_enum_value = (newColor as Avo.LabelOrClass.Color).value;
		setLabels([...labels]);
	};

	const handleRowLabelChanged = (label: Avo.LabelOrClass.LabelOrClass, newLabel: string) => {
		label.label = newLabel;
		setLabels([...labels]);
	};

	const handleRowDelete = (id: string) => {
		setLabels([...labels.filter((labelObj) => labelObj.id !== id)]);
	};

	const labelsExceedMaxLength = (labels: Avo.LabelOrClass.LabelOrClass[]) => {
		return !labels.find((label) => (label.label?.length || 0) > MAX_LABEL_LENGTH);
	};

	const handleSaveLabels = async () => {
		try {
			setIsProcessing(true);
			const initialLabelIds = initialLabels.map((l) => l.id);
			const updatedLabelIds = labels.map((l) => l.id);

			if (!labelsExceedMaxLength(labels)) {
				ToastService.danger(
					tHtml('Een of meerdere labels is langer dan max length karakters', {
						maxLength: MAX_LABEL_LENGTH,
					})
				);
				setIsProcessing(false);
				return;
			}

			const newIds = without(updatedLabelIds, ...initialLabelIds);
			const oldIds = without(initialLabelIds, ...updatedLabelIds);
			const updatedIds = intersection(initialLabelIds, updatedLabelIds);

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
					? tHtml('De nieuwe labels zijn opgeslagen')
					: tHtml('De nieuwe klassen zijn opgeslagen')
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to save label changes', err, {
					initialLabels,
					labels,
				})
			);
			ToastService.danger(tHtml('Het opslaan van de labels is mislukt'));
		}
		setIsProcessing(false);
	};

	const renderCell = (rowData: any, columnId: string) => {
		const label = rowData as Avo.LabelOrClass.LabelOrClass;
		const colorOptions: ColorOption[] = labelColors.map((labelColor) => ({
			label: '',
			value: labelColor.value,
			color: labelColor.label,
		}));
		switch (columnId) {
			case 'color':
				return (
					<Spacer margin="right-small">
						<ColorSelect
							options={colorOptions}
							value={colorOptions.find(
								(colorOption) => colorOption.value === label.color_enum_value
							)}
							onChange={(newColor) =>
								handleRowColorChanged(label, newColor as ColorOption)
							}
						/>
					</Spacer>
				);

			case 'label':
				return (
					<Spacer margin="right-small">
						<TextInput
							value={label.label || ''}
							onChange={(newLabel) => handleRowLabelChanged(label, newLabel)}
						/>

						<label
							className={clsx('c-max-length', {
								'c-max-length--invalid':
									(label.label?.length || 0) > MAX_LABEL_LENGTH,
							})}
						>
							{`${label.label?.length || 0}/${MAX_LABEL_LENGTH}`}
						</label>
					</Spacer>
				);

			case ACTIONS_TABLE_COLUMN_ID:
				return (
					<Button
						ariaLabel={tText('Verwijder dit label')}
						title={tText('Verwijder dit label')}
						onClick={() => handleRowDelete(label.id)}
						type="danger-hover"
						icon={IconName.delete}
					/>
				);
		}
	};

	const tooltip = type === 'LABEL' ? tText('Beheer je labels') : tText('aBeheer je klassen');

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
				title={getManageLabelsTranslations(type).modal.title}
				size="large"
				isOpen={isManageLabelsModalOpen}
				onClose={handleOnClose}
				scrollable
			>
				<ModalBody>
					<Spacer margin="bottom-large">
						<Button
							label={getManageLabelsTranslations(type).buttons.addLabel}
							icon={IconName.plus}
							onClick={handleAddLabelClick}
							type="secondary"
						/>
					</Spacer>
					<Table
						columns={[
							{
								label: getManageLabelsTranslations(type).columns.color,
								id: 'color',
								col: '2',
							},
							{
								label: getManageLabelsTranslations(type).columns.type,
								id: 'label',
							},
							{ label: '', id: ACTIONS_TABLE_COLUMN_ID },
						]}
						emptyStateMessage={getManageLabelsTranslations(type).emptyState}
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
										label={tText('Annuleren')}
										type="secondary"
										block
										onClick={onClose}
										disabled={isProcessing}
									/>
									<Button
										label={tText('Opslaan')}
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

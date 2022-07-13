import { Button, Flex, FlexItem, Spacer, TagList, TagOption } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentLabelType } from '@viaa/avo2-types/types/assignment';
import { cloneDeep, get } from 'lodash-es';
import React, { FunctionComponent, MouseEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ValueType } from 'react-select';

import { ColorSelect } from '../../admin/content-block/components/fields';
import { ColorOption } from '../../admin/content-block/components/fields/ColorSelect/ColorSelect';
import { AssignmentLabelsService, ToastService } from '../../shared/services';
import { AssignmentSchemaLabel_v2 } from '../assignment.types';

import './AssignmentLabels.scss';
import ManageAssignmentLabels from './modals/ManageAssignmentLabels';

export type AssignmentLabelsProps = Pick<Avo.Assignment.Assignment_v2, 'labels'> & {
	id?: string;
	onChange: (changed: AssignmentSchemaLabel_v2[]) => void;
	user: Avo.User.User;
	dictionary?: {
		placeholder: string;
		empty: string;
	};
	editable?: boolean;
	type?: AssignmentLabelType;
};

const AssignmentLabels: FunctionComponent<AssignmentLabelsProps> = ({
	id,
	labels,
	user,
	onChange,
	type = 'LABEL',
	editable,
	...props
}) => {
	const [t] = useTranslation();
	const dictionary = {
		placeholder: t('assignment/views/assignment-edit___voeg-een-vak-of-project-toe'),
		empty: t('assignment/views/assignment-edit___geen-vakken-of-projecten-beschikbaar'),
		...(props.dictionary ? props.dictionary : {}),
	};

	const [allAssignmentLabels, setAllAssignmentLabels] = useState<Avo.Assignment.Label_v2[]>([]);
	const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = useState<boolean>(false);

	const fetchAssignmentLabels = useCallback(async () => {
		// Fetch labels every time the manage labels modal closes and once at startup
		const labels = await AssignmentLabelsService.getLabelsForProfile(get(user, 'profile.id'));
		setAllAssignmentLabels(labels);
	}, [user, setAllAssignmentLabels]);

	useEffect(() => {
		fetchAssignmentLabels();
	}, [fetchAssignmentLabels]);

	const getAssignmentLabelOptions = (labels: Avo.Assignment.Label_v2[]): TagOption[] => {
		return labels.map((labelObj) => ({
			label: labelObj.label || '',
			id: labelObj.id,
			// labelObj.enum_color.label contains hex code (graphql enum quirk)
			// The value of the enum has to be uppercase text, so the value contains the color name
			color: labelObj.color_override || get(labelObj, 'enum_color.label'),
		}));
	};

	const handleManageAssignmentLabelsModalClosed = () => {
		fetchAssignmentLabels();
		setIsManageLabelsModalOpen(false);
	};

	const getColorOptions = (labels: Avo.Assignment.Label_v2[]): ColorOption[] => {
		return labels
			.filter((item) => !type || item.type === type)
			.map((labelObj) => ({
				label: labelObj.label || '',
				value: String(labelObj.id),
				// labelObj.enum_color.label contains hex code (graphql enum quirk)
				// The value of the enum has to be uppercase text, so the value contains the color name
				color: labelObj.color_override || get(labelObj, 'enum_color.label'),
			}));
	};

	const addAssignmentLabel = (labelOption: ValueType<ColorOption, any>) => {
		if (!labelOption) {
			ToastService.danger(
				t(
					'assignment/views/assignment-edit___het-geselecteerde-label-kon-niet-worden-toegevoegd-aan-de-opdracht'
				)
			);
			return;
		}

		const assignmentLabel = allAssignmentLabels.find(
			(labelObj) => String(labelObj.id) === (labelOption as ColorOption).value
		);

		if (!assignmentLabel) {
			ToastService.danger(
				t(
					'assignment/views/assignment-edit___het-geselecteerde-label-kon-niet-worden-toegevoegd-aan-de-opdracht'
				)
			);
			return;
		}

		onChange([
			...labels,
			{
				assignment_label: assignmentLabel,
			},
		]);
	};

	const deleteAssignmentLabel = (labelId: string | number, evt: MouseEvent) => {
		evt.stopPropagation();
		onChange(labels.filter((item) => item.assignment_label.id !== labelId));
	};

	const assignmentLabelIds = labels.map((item) => item.assignment_label.id);
	const unselectedLabels = cloneDeep(
		allAssignmentLabels.filter((item) => !assignmentLabelIds.includes(item.id))
	);

	return (
		<>
			<TagList
				closable={editable}
				tags={getAssignmentLabelOptions(labels.map((item) => item.assignment_label))}
				onTagClosed={deleteAssignmentLabel}
			/>
			{!editable && labels.length === 0 && <p>{t('-')}</p>}
			{editable && (
				<>
					<Flex>
						<FlexItem>
							<Spacer margin="right-small">
								<ColorSelect
									id={id}
									options={getColorOptions(unselectedLabels)}
									value={null}
									onChange={addAssignmentLabel}
									placeholder={dictionary.placeholder}
									noOptionsMessage={() => dictionary.empty}
								/>
							</Spacer>
						</FlexItem>
						<FlexItem shrink>
							<Button
								icon="settings"
								title="Beheer je vakken en projecten"
								ariaLabel="Beheer je vakken en projecten"
								type="borderless"
								size="large"
								className="c-button__labels"
								onClick={() => setIsManageLabelsModalOpen(true)}
							/>
						</FlexItem>
					</Flex>

					<ManageAssignmentLabels
						onClose={handleManageAssignmentLabelsModalClosed}
						isOpen={isManageLabelsModalOpen}
						user={user}
						type={type}
					/>
				</>
			)}
		</>
	);
};

export default AssignmentLabels;

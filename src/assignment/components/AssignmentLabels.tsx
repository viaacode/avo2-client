import { type ColorOption } from '@meemoo/admin-core-ui/admin';
import {
	Button,
	Flex,
	FlexItem,
	IconName,
	Spacer,
	TagList,
	type TagOption,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import { cloneDeep, get } from 'lodash-es';
import React, { type FC, type MouseEvent, useCallback, useEffect, useState } from 'react';

import { commonUserAtom } from '../../authentication/authentication.store';
import { ColorSelect } from '../../shared/components/ColorSelect/ColorSelect';
import { type Lookup_Enum_Colors_Enum } from '../../shared/generated/graphql-db-types';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { AssignmentLabelsService } from '../../shared/services/assignment-labels-service/assignment-labels.service';
import { ToastService } from '../../shared/services/toast-service';

import { ManageAssignmentLabels } from './modals/ManageAssignmentLabels';

import './AssignmentLabels.scss';

type AssignmentLabelsProps = {
	labels: { assignment_label: Avo.Assignment.Label }[];
	id?: string;
	onChange: (changed: { assignment_label: Avo.Assignment.Label }[]) => void;
	dictionary?: {
		placeholder: string;
		empty: string;
	};
	type?: Avo.Assignment.LabelType;
};

export const AssignmentLabels: FC<AssignmentLabelsProps> = ({
	id,
	labels,
	onChange,
	type = 'LABEL',
	...props
}) => {
	const commonUser = useAtomValue(commonUserAtom);

	const dictionary = {
		placeholder: tText('assignment/views/assignment-edit___voeg-een-vak-of-project-toe'),
		empty: tText('assignment/views/assignment-edit___geen-vakken-of-projecten-beschikbaar'),
		...(props.dictionary ? props.dictionary : {}),
	};

	const [allAssignmentLabels, setAllAssignmentLabels] = useState<Avo.Assignment.Label[]>([]);
	const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = useState<boolean>(false);

	const fetchAssignmentLabels = useCallback(async () => {
		if (commonUser?.profileId) {
			// Fetch labels every time the manage labels modal closes and once at startup
			const labels = await AssignmentLabelsService.getLabelsForProfile(commonUser.profileId);
			setAllAssignmentLabels(labels);
		}
	}, [commonUser?.profileId, setAllAssignmentLabels]);

	useEffect(() => {
		fetchAssignmentLabels();
	}, [fetchAssignmentLabels]);

	const getAssignmentLabelOptions = (labels: Avo.Assignment.Label[]): TagOption[] => {
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

	const getColorOptions = (labels: Avo.Assignment.Label[]): ColorOption[] => {
		return labels
			.filter((item) => !type || item.type === type)
			.map((labelObj) => ({
				label: labelObj.label || '',
				value: String(labelObj.id) as Lookup_Enum_Colors_Enum,
				// labelObj.enum_color.label contains hex code (graphql enum quirk)
				// The value of the enum has to be uppercase text, so the value contains the color name
				color: labelObj.color_override || get(labelObj, 'enum_color.label'),
			}));
	};

	const addAssignmentLabel = (labelOption?: unknown) => {
		if (!labelOption) {
			ToastService.danger(
				tHtml(
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
				tHtml(
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

	const tooltip =
		type === 'LABEL'
			? tText('assignment/components/assignment-labels___beheer-je-labels')
			: tText('assignment/components/assignment-labels___beheer-je-klassen');
	return (
		<>
			<TagList
				tags={getAssignmentLabelOptions(labels.map((item) => item.assignment_label))}
				onTagClosed={deleteAssignmentLabel}
				closable
			/>

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
						icon={IconName.settings}
						title={tooltip}
						ariaLabel={tooltip}
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
				type={type}
			/>
		</>
	);
};

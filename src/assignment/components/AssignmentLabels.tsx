import { type ColorOption } from '@meemoo/admin-core-ui/dist/admin.mjs';
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
import { cloneDeep, get } from 'lodash-es';
import React, { type FC, type MouseEvent, useCallback, useEffect, useState } from 'react';

import { ColorSelect } from '../../shared/components/ColorSelect/ColorSelect';
import ManageLabelsClasses from '../../shared/components/ManageLabelsClasses/ManageLabelsClasses';
import { type Lookup_Enum_Colors_Enum } from '../../shared/generated/graphql-db-types';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { LabelsClassesService } from '../../shared/services/labels-classes';
import { ToastService } from '../../shared/services/toast-service';

import './AssignmentLabels.scss';

type AssignmentLabelsProps = {
	labels: { assignment_label: Avo.LabelClass.LabelClass }[];
	id?: string;
	onChange: (changed: { assignment_label: Avo.LabelClass.LabelClass }[]) => void;
	dictionary?: {
		placeholder: string;
		empty: string;
	};
	type?: Avo.LabelClass.Type;
};

const AssignmentLabels: FC<AssignmentLabelsProps & UserProps> = ({
	id,
	labels,
	commonUser,
	onChange,
	type = 'LABEL',
	...props
}) => {
	const { tText, tHtml } = useTranslation();
	const dictionary = {
		placeholder: tText('assignment/views/assignment-edit___voeg-een-vak-of-project-toe'),
		empty: tText('assignment/views/assignment-edit___geen-vakken-of-projecten-beschikbaar'),
		...(props.dictionary ? props.dictionary : {}),
	};

	const [allAssignmentLabels, setAllAssignmentLabels] = useState<Avo.LabelClass.LabelClass[]>([]);
	const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = useState<boolean>(false);

	const fetchAssignmentLabels = useCallback(async () => {
		// Fetch labels every time the manage labels modal closes and once at startup
		setAllAssignmentLabels(await LabelsClassesService.getLabelsForProfile());
	}, [setAllAssignmentLabels]);

	useEffect(() => {
		fetchAssignmentLabels();
	}, [fetchAssignmentLabels]);

	const getAssignmentLabelOptions = (labels: Avo.LabelClass.LabelClass[]): TagOption[] => {
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

	const getColorOptions = (labels: Avo.LabelClass.LabelClass[]): ColorOption[] => {
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

			<ManageLabelsClasses
				onClose={handleManageAssignmentLabelsModalClosed}
				isOpen={isManageLabelsModalOpen}
				type={type}
			/>
		</>
	);
};

export default withUser(AssignmentLabels) as FC<AssignmentLabelsProps>;

import { FormGroup, Spacer, TagsInput } from '@viaa/avo2-components';
import { TagInfoSchema } from '@viaa/avo2-components/dist/esm/components/TagsInput/TagsInput';
import type { Avo } from '@viaa/avo2-types';
import { LomType } from '@viaa/avo2-types';
import { filter, map, sortBy, uniq } from 'lodash-es';
import React, { FC, useMemo } from 'react';

import { groupLoms } from '../../helpers/lom';
import { useGetLomFields } from '../../hooks/useGetLomFields';
import useTranslation from '../../hooks/useTranslation';
import { LomFieldsByScheme } from '../../types/lom';

import {
	getParentEducationLevel,
	mapLomFieldsToOptions,
	mapOptionsToLomFields,
} from './LomFieldsInput.helpers';

type LomFieldsInputProps = {
	loms: Avo.Lom.LomField[];
	onChange: (newLoms: Avo.Lom.LomField[]) => void;
	showThemes?: boolean;
	educationLevelsPlaceholder?: string;
	subjectsPlaceholder?: string;
	themesPlaceholder?: string;
};

const LomFieldsInput: FC<LomFieldsInputProps> = ({
	loms,
	onChange,
	showThemes = false,
	educationLevelsPlaceholder,
	subjectsPlaceholder,
	themesPlaceholder,
}) => {
	const { tText } = useTranslation();
	const lomFields = useMemo(() => {
		return groupLoms(loms);
	}, [loms]);
	const { data: allEducationLevels, isLoading: isEducationLevelsLoading } =
		useGetLomFields('structure');
	const { data: allSubjects, isLoading: isSubjectsLoading } = useGetLomFields('subject');
	const { data: allThemes, isLoading: isThemesLoading } = useGetLomFields('theme');

	const getEducationLevelOptions = (loms: Avo.Lom.LomField[]) => {
		// Group loms to split the incoming loms in levels and degrees
		const groupedLoms = groupLoms(loms);
		const parentIdsOfDegrees = map(groupedLoms.educationDegree, 'broader');
		// Filter out the education levels which have a child education degree
		const childlessLevels = filter(
			groupedLoms.educationLevel,
			(level) => !parentIdsOfDegrees.includes(level.id)
		);

		return mapLomFieldsToOptions(
			sortBy([...groupedLoms.educationDegree, ...childlessLevels], (lom) =>
				lom.label.toLocaleLowerCase()
			)
		);
	};

	const handleChange = (
		values: TagInfoSchema[],
		scheme: LomType,
		allSchemeLoms: Avo.Lom.LomField[]
	): void => {
		let newLoms: LomFieldsByScheme;
		let flatLomList: Avo.Lom.LomField[];
		const mappedLoms = mapOptionsToLomFields(values, allSchemeLoms);

		if (scheme === LomType.educationDegree) {
			const groupedLoms = groupLoms(mappedLoms);
			newLoms = {
				...lomFields,
				educationDegree: groupedLoms.educationDegree,
				educationLevel: groupedLoms.educationLevel,
			};

			const parentEducationLevels = getParentEducationLevel(
				mappedLoms,
				allEducationLevels || []
			);

			flatLomList = [...Object.values(newLoms).flat(), ...parentEducationLevels];
		} else {
			newLoms = { ...lomFields, [scheme]: mappedLoms };
			flatLomList = Object.values(newLoms).flat();
		}

		onChange(uniq(flatLomList));
	};

	return (
		<Spacer margin="bottom">
			<FormGroup label={tText('Onderwijs')} labelFor="classificationId">
				<TagsInput
					isLoading={isEducationLevelsLoading}
					options={getEducationLevelOptions(allEducationLevels || [])}
					value={
						getEducationLevelOptions([
							...lomFields.educationDegree,
							...lomFields.educationLevel,
						]) || []
					}
					onChange={(values) =>
						handleChange(values, LomType.educationDegree, allEducationLevels || [])
					}
					placeholder={educationLevelsPlaceholder}
				/>
			</FormGroup>

			<FormGroup
				label={tText('shared/components/lom-fields-input/lom-fields-input___vakken')}
				labelFor="subjectId"
			>
				<TagsInput
					isLoading={isSubjectsLoading}
					options={mapLomFieldsToOptions(allSubjects || [])}
					value={mapLomFieldsToOptions(lomFields.subject) || []}
					onChange={(values) => handleChange(values, LomType.subject, allSubjects || [])}
					placeholder={subjectsPlaceholder}
				/>
			</FormGroup>

			{showThemes && (
				<FormGroup
					label={tText('shared/components/lom-fields-input/lom-fields-input___themas')}
					labelFor="themeId"
				>
					<TagsInput
						isLoading={isThemesLoading}
						options={mapLomFieldsToOptions(allThemes || [])}
						value={mapLomFieldsToOptions(lomFields.theme) || []}
						onChange={(values) => handleChange(values, LomType.theme, allThemes || [])}
						placeholder={themesPlaceholder}
					/>
				</FormGroup>
			)}
		</Spacer>
	);
};

export default LomFieldsInput;

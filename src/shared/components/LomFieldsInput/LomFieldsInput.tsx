import { FormGroup, Spacer, TagsInput } from '@viaa/avo2-components';
import { TagInfoSchema } from '@viaa/avo2-components/dist/esm/components/TagsInput/TagsInput';
import type { Avo } from '@viaa/avo2-types';
import { LomType } from '@viaa/avo2-types';
import { filter, isNil, map, sortBy, uniq } from 'lodash-es';
import React, { FC, useMemo } from 'react';

import { groupLoms } from '../../helpers/lom';
import { useGetLomFields } from '../../hooks/useGetLomFields';
import useTranslation from '../../hooks/useTranslation';
import { LomFieldsByScheme } from '../../types/lom';

import {
	getParentContext,
	mapLomFieldsToOptions,
	mapOptionsToLomFields,
} from './LomFieldsInput.helpers';

type LomFieldsInputProps = {
	loms: Avo.Lom.LomField[];
	onChange: (newLoms: Avo.Lom.LomField[]) => void;
	showEducation?: boolean;
	showThemes?: boolean;
	showSubjects?: boolean;
	educationLevelsPlaceholder?: string;
	subjectsPlaceholder?: string;
	themesPlaceholder?: string;
};

const LomFieldsInput: FC<LomFieldsInputProps> = ({
	loms,
	onChange,
	showEducation = true,
	showThemes = true,
	showSubjects = true,
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

	const getEducationLevelsOptions = (allEducationLevels: Avo.Lom.LomField[]) => {
		const degrees = filterAllEduLevels(allEducationLevels);
		const parentIdsOfDegrees = map(degrees, 'broader');
		const levels = filter(allEducationLevels, (level) => isNil(level.broader));
		const childlessParents = filter(levels, (level) => !parentIdsOfDegrees.includes(level.id));

		return mapLomFieldsToOptions(
			sortBy([...degrees, ...childlessParents], (lom) => lom.label.toLocaleLowerCase())
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

			const parentContexts = getParentContext(mappedLoms, allEducationLevels || []);

			flatLomList = [...Object.values(newLoms).flat(), ...parentContexts];
		} else {
			newLoms = { ...lomFields, [scheme]: mappedLoms };
			flatLomList = Object.values(newLoms).flat();
		}

		onChange(uniq(flatLomList));
	};

	const filterAllEduLevels = (loms: Avo.Lom.LomField[]): Avo.Lom.LomField[] => {
		return filter(loms, (lom) => !isNil(lom?.broader));
	};

	return (
		<Spacer margin="bottom">
			{showEducation && (
				<FormGroup label={tText('Onderwijs')} labelFor="classificationId">
					<TagsInput
						isLoading={isEducationLevelsLoading}
						options={getEducationLevelsOptions(allEducationLevels || [])}
						value={
							getEducationLevelsOptions([
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
			)}

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

			{showSubjects && (
				<FormGroup
					label={tText('shared/components/lom-fields-input/lom-fields-input___vakken')}
					labelFor="subjectId"
				>
					<TagsInput
						isLoading={isSubjectsLoading}
						options={mapLomFieldsToOptions(allSubjects || [])}
						value={mapLomFieldsToOptions(lomFields.subject) || []}
						onChange={(values) =>
							handleChange(values, LomType.subject, allSubjects || [])
						}
						placeholder={subjectsPlaceholder}
					/>
				</FormGroup>
			)}
		</Spacer>
	);
};

export default LomFieldsInput;

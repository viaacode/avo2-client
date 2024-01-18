import { FormGroup, Spacer, type TagInfo, TagsInput } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { LomType } from '@viaa/avo2-types';
import { filter, map, sortBy, uniq } from 'lodash-es';
import React, { FC, useMemo } from 'react';

import { groupLoms } from '../../helpers/lom';
import { lomToTagInfo } from '../../helpers/string-to-select-options';
import { useLomEducationLevels } from '../../hooks/useLomEducationLevels';
import { useLomSubjects } from '../../hooks/useLomSubjects';
import { useLomThemes } from '../../hooks/useLomThemes';
import useTranslation from '../../hooks/useTranslation';
import { LomFieldsByScheme } from '../../types/lom';
import MultiThemeSelectDropdown from '../MultiThemeSelectDropdown/MultiThemeSelectDropdown';

import {
	getParentEducationLevel,
	mapLomFieldsToOptions,
	mapOptionsToLomFields,
} from './LomFieldsInput.helpers';

type LomFieldsInputProps = {
	loms: Avo.Lom.LomField[];
	onChange: (newLoms: Avo.Lom.LomField[]) => void;
	showEducation?: boolean;
	showEducationDegrees?: boolean;
	showThemes?: boolean;
	showSubjects?: boolean;
	isEducationRequired?: boolean;
	isEducationDegreesRequired?: boolean;
	isThemesRequired?: boolean;
	isSubjectsRequired?: boolean;
	educationLevelsPlaceholder?: string;
	subjectsPlaceholder?: string;
	themesPlaceholder?: string;

	/**
	 * only show degrees for the already selected education degrees. This option is only used to allow users that haven't selected a degree but have already an education level, to also specify their education ldegrees on their profile page
	 * https://meemoo.atlassian.net/browse/AVO-2881?focusedCommentId=43453
	 */
	limitDegreesByAlreadySelectedLevels?: boolean;
};

const LomFieldsInput: FC<LomFieldsInputProps> = ({
	loms,
	onChange,
	showEducation = true,
	showEducationDegrees = false,
	showThemes = true,
	showSubjects = true,
	isEducationRequired = false,
	isEducationDegreesRequired = false,
	isThemesRequired = false,
	isSubjectsRequired = false,
	educationLevelsPlaceholder,
	subjectsPlaceholder,
	themesPlaceholder,
	limitDegreesByAlreadySelectedLevels = false,
}) => {
	const { tText } = useTranslation();
	const lomFields = useMemo(() => {
		return groupLoms(loms);
	}, [loms]);
	const [allEducationLevels, isEducationLevelsLoading] = useLomEducationLevels();
	const [allSubjects, isSubjectsLoading] = useLomSubjects();
	const [allThemes, isThemesLoading] = useLomThemes();

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
		values: TagInfo[],
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

	const getEducationDegreeOptions = () => {
		return groupLoms(allEducationLevels)
			?.educationDegree?.filter((degree) => {
				return (
					!limitDegreesByAlreadySelectedLevels ||
					(degree.broader &&
						lomFields.educationLevel.map((level) => level.id).includes(degree.broader))
				);
			})
			?.map(lomToTagInfo);
	};

	const educationDegreeOptions = getEducationDegreeOptions();
	return (
		<Spacer margin="bottom">
			{showEducation && (
				<FormGroup
					label={tText('shared/components/lom-fields-input/lom-fields-input___onderwijs')}
					labelFor="educationId"
					required={isEducationRequired}
				>
					<TagsInput
						id="educationId"
						isLoading={isEducationLevelsLoading}
						options={allEducationLevels?.map(lomToTagInfo)}
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
			)}
			{showEducationDegrees && !!educationDegreeOptions.length && (
				<FormGroup
					label={tText(
						'shared/components/lom-fields-input/lom-fields-input___onderwijsgraden'
					)}
					labelFor="educationDegreesId"
					required={isEducationDegreesRequired}
				>
					<TagsInput
						id="educationDegreesId"
						isLoading={isEducationLevelsLoading}
						options={getEducationDegreeOptions()}
						value={getEducationLevelOptions([...lomFields.educationDegree]) || []}
						onChange={(values) =>
							handleChange(
								[
									...values,
									...(getEducationLevelOptions([...lomFields.educationLevel]) ||
										[]),
								],
								LomType.educationDegree,
								allEducationLevels || []
							)
						}
						placeholder={educationLevelsPlaceholder}
					/>
				</FormGroup>
			)}
			{showThemes && !!allThemes?.length && (
				<FormGroup
					label={tText('shared/components/lom-fields-input/lom-fields-input___themas')}
					labelFor="themeId"
					required={isThemesRequired}
				>
					<MultiThemeSelectDropdown
						id="themeId"
						allThemes={allThemes}
						value={mapLomFieldsToOptions(lomFields.theme) || []}
						onChange={(values) => handleChange(values, LomType.theme, allThemes || [])}
						placeholder={themesPlaceholder}
						isLoading={isThemesLoading}
					/>
				</FormGroup>
			)}
			{showSubjects && (
				<FormGroup
					label={tText('shared/components/lom-fields-input/lom-fields-input___vakken')}
					labelFor="subjectId"
					required={isSubjectsRequired}
				>
					<TagsInput
						id="subjectId"
						isLoading={isSubjectsLoading}
						options={allSubjects?.map(lomToTagInfo)}
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

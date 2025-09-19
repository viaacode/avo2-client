import { FormGroup, Spacer, type TagInfo, TagsInput } from '@viaa/avo2-components';
import { type Avo, LomType } from '@viaa/avo2-types';
import { uniq } from 'lodash-es';
import React, { type FC, useMemo } from 'react';

import { getBottomLoms } from '../../helpers/get-bottom-loms';
import { groupLoms } from '../../helpers/lom';
import { lomToTagInfo } from '../../helpers/string-to-select-options';
import { useLomEducationLevelsAndDegrees } from '../../hooks/useLomEducationLevelsAndDegrees';
import { useLomSubjects } from '../../hooks/useLomSubjects';
import { useLomThemes } from '../../hooks/useLomThemes';
import { useTranslation } from '../../hooks/useTranslation';
import { type LomFieldsByScheme } from '../../types/lom';
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
	educationLabel?: string;
	educationDegreesLabel?: string;
	themesLabel?: string;
	subjectsLabel?: string;
	isEducationRequired?: boolean;
	isEducationDegreesRequired?: boolean;
	isThemesRequired?: boolean;
	isSubjectsRequired?: boolean;
	educationLevelsPlaceholder?: string;
	subjectsPlaceholder?: string;
	themesPlaceholder?: string;
	filterSubjects?: (subject: Avo.Lom.LomField) => boolean;

	/**
	 * only show degrees for the already selected education degrees. This option is only used to allow users that haven't selected a degree but have already an education level, to also specify their education ldegrees on their profile page
	 * https://meemoo.atlassian.net/browse/AVO-2881?focusedCommentId=43453
	 */
	limitDegreesByAlreadySelectedLevels?: boolean;
	allowMultiSelect?: boolean;
};

export const LomFieldsInput: FC<LomFieldsInputProps> = ({
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
	educationLabel,
	educationDegreesLabel,
	themesLabel,
	subjectsLabel,
	educationLevelsPlaceholder,
	subjectsPlaceholder,
	themesPlaceholder,
	limitDegreesByAlreadySelectedLevels = false,
	filterSubjects = () => true,
	allowMultiSelect = true,
}) => {
	const { tText } = useTranslation();
	const lomFields = useMemo(() => groupLoms(loms), [loms]);
	const { data: educationLevelsAndDegrees, isLoading: isEducationLevelsLoading } =
		useLomEducationLevelsAndDegrees();
	const [allSubjects, isSubjectsLoading] = useLomSubjects();
	const [allThemes, isThemesLoading] = useLomThemes();

	const getEducationLevelOptions = (loms: Avo.Lom.LomField[]) =>
		mapLomFieldsToOptions(getBottomLoms(loms));

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
				educationLevelsAndDegrees || []
			);

			flatLomList = [...Object.values(newLoms).flat(), ...parentEducationLevels];
		} else {
			newLoms = { ...lomFields, [scheme]: mappedLoms };
			flatLomList = Object.values(newLoms).flat();
		}

		onChange(uniq(flatLomList));
	};

	const getEducationDegreeOptions = () => {
		return groupLoms(educationLevelsAndDegrees || [])
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
					label={
						educationLabel ||
						tText('shared/components/lom-fields-input/lom-fields-input___onderwijs')
					}
					labelFor="educationId"
					required={isEducationRequired}
				>
					<TagsInput
						id="educationId"
						isLoading={isEducationLevelsLoading}
						options={getEducationLevelOptions(educationLevelsAndDegrees || [])}
						value={
							getEducationLevelOptions([
								...lomFields.educationDegree,
								...lomFields.educationLevel,
							]) || []
						}
						onChange={(values) =>
							handleChange(
								values,
								LomType.educationDegree,
								educationLevelsAndDegrees || []
							)
						}
						placeholder={educationLevelsPlaceholder}
						allowMulti={allowMultiSelect}
					/>
				</FormGroup>
			)}
			{showEducationDegrees && !!educationDegreeOptions.length && (
				<FormGroup
					label={
						educationDegreesLabel ||
						tText(
							'shared/components/lom-fields-input/lom-fields-input___onderwijsgraden'
						)
					}
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
								educationLevelsAndDegrees || []
							)
						}
						placeholder={educationLevelsPlaceholder}
						allowMulti={allowMultiSelect}
					/>
				</FormGroup>
			)}
			{showThemes && !!allThemes?.length && (
				<FormGroup
					label={
						themesLabel ||
						tText('shared/components/lom-fields-input/lom-fields-input___themas')
					}
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
						allowMulti={allowMultiSelect}
					/>
				</FormGroup>
			)}
			{showSubjects && (
				<FormGroup
					label={
						subjectsLabel ||
						tText('shared/components/lom-fields-input/lom-fields-input___vakken')
					}
					labelFor="subjectId"
					required={isSubjectsRequired}
				>
					<TagsInput
						id="subjectId"
						isLoading={isSubjectsLoading}
						options={allSubjects?.filter(filterSubjects).map(lomToTagInfo)}
						value={mapLomFieldsToOptions(lomFields.subject) || []}
						onChange={(values) =>
							handleChange(values, LomType.subject, allSubjects || [])
						}
						placeholder={subjectsPlaceholder}
						allowMulti={allowMultiSelect}
					/>
				</FormGroup>
			)}
		</Spacer>
	);
};

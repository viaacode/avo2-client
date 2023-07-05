import { FormGroup, Spacer, TagsInput } from '@viaa/avo2-components';
import { TagInfoSchema } from '@viaa/avo2-components/dist/esm/components/TagsInput/TagsInput';
import type { Avo } from '@viaa/avo2-types';
import { LomType } from '@viaa/avo2-types';
import { filter, isNil, map, uniq } from 'lodash-es';
import React, { FC, useMemo } from 'react';

import { groupLoms } from '../../helpers/lom';
import { useGetLomEducationLevels } from '../../hooks/useGetLomEducationLevels';
import { useGetLomSubjects } from '../../hooks/useGetLomSubjects';
import { useGetLomThemes } from '../../hooks/useGetLomThemes';
import useTranslation from '../../hooks/useTranslation';

import {
	getParentContext,
	mapLomFieldsToOptions,
	mapOptionsToLomFields,
} from './LomFieldsInput.helpers';

type LomFieldsInputProps = {
	loms: Avo.Lom.LomField[];
	onChange: (newLoms: Avo.Lom.LomField[]) => void;
	showThemes?: boolean;
};

const LomFieldsInput: FC<LomFieldsInputProps> = ({ loms, onChange, showThemes }) => {
	const { tText } = useTranslation();
	const lomFields = useMemo(() => {
		return groupLoms(loms);
	}, [loms]);
	const { data: allEducationLevels, isLoading: isEducationLevelsLoading } =
		useGetLomEducationLevels();
	const { data: allSubjects, isLoading: isSubjectsLoading } = useGetLomSubjects(
		map(lomFields.educationLevel, 'id')
	);
	const { data: allThemes, isLoading: isThemesLoading } = useGetLomThemes(
		map([...lomFields.educationLevel, ...lomFields.subject], 'id')
	);

	const handleChange = (
		values: TagInfoSchema[],
		scheme: LomType,
		allSchemeLoms: Avo.Lom.LomField[]
	) => {
		const mappedLoms = mapOptionsToLomFields(values, allSchemeLoms);
		const newLoms = { ...lomFields, [scheme]: mappedLoms };
		let flatLomList: Avo.Lom.LomField[];
		flatLomList = Object.values(newLoms).flat();

		if (scheme === LomType.educationLevel) {
			const parentContexts = getParentContext(mappedLoms, allEducationLevels || []);

			flatLomList = [...flatLomList, ...parentContexts];
		}

		onChange(uniq(flatLomList));
	};

	const filterAllEduLevels = (loms: Avo.Lom.LomField[]) => {
		return filter(loms, (lom) => !isNil(lom?.broader));
	};

	return (
		<Spacer margin="bottom">
			<FormGroup
				label={tText(
					'shared/components/lom-fields-input/lom-fields-input___onderwijsniveau'
				)}
				labelFor="classificationId"
			>
				<TagsInput
					isLoading={isEducationLevelsLoading}
					options={mapLomFieldsToOptions(filterAllEduLevels(allEducationLevels || []))}
					value={mapLomFieldsToOptions(lomFields.educationLevel) || []}
					onChange={(values) =>
						handleChange(values, LomType.educationLevel, allEducationLevels || [])
					}
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
				/>
			</FormGroup>

			{!showThemes && (
				<FormGroup
					label={tText('shared/components/lom-fields-input/lom-fields-input___themas')}
					labelFor="themeId"
				>
					<TagsInput
						isLoading={isThemesLoading}
						options={mapLomFieldsToOptions(allThemes || [])}
						value={mapLomFieldsToOptions(lomFields.theme) || []}
						onChange={(values) => handleChange(values, LomType.theme, allThemes || [])}
					/>
				</FormGroup>
			)}
		</Spacer>
	);
};

export default LomFieldsInput;

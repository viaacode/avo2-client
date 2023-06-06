import { Form, FormGroup, Spacer, TagsInput } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { differenceWith, isEmpty, isEqual, isNil, map, without } from 'lodash-es';
import React, { FC, useEffect, useState } from 'react';

import { CustomError } from '../../helpers';
import useTranslation from '../../hooks/useTranslation';
import { LomService } from '../../services/lom.service';

import { mapLomFieldsToOptions, mapOptionsToLomFields } from './LomFieldsInput.helpers';

type LomFieldsInputProps = {
	contexts: Avo.Lom.LomField[];
	educationLevels: Avo.Lom.LomField[];
	subjects: Avo.Lom.LomField[];
	themes: Avo.Lom.LomField[];
	onChangeContexts: (newContexts: Avo.Lom.LomField[]) => void;
	onChangeEducationLevels: (newEducationLevels: Avo.Lom.LomField[]) => void;
	onChangeSubjects: (newSubjects: Avo.Lom.LomField[]) => void;
	onChangeThemes: (newThemes: Avo.Lom.LomField[]) => void;
};

const LomFieldsInput: FC<LomFieldsInputProps> = ({
	contexts,
	educationLevels,
	subjects,
	themes,
	onChangeContexts,
	onChangeEducationLevels,
	onChangeSubjects,
	onChangeThemes,
}) => {
	const { tText } = useTranslation();
	const [educationLevelsOptions, setEducationLevelsOptions] = useState<Avo.Lom.LomField[]>([]);
	const [subjectsOptions, setSubjectsOptions] = useState<Avo.Lom.LomField[]>([]);
	const [themesOptions, setThemesOptions] = useState<Avo.Lom.LomField[]>([]);

	useEffect(() => {
		let fetch = true;

		LomService.fetchEducationLevels()
			.then((res: Avo.Lom.LomField[]) => {
				fetch && setEducationLevelsOptions(res);
			})
			.catch((err) => {
				console.error(
					new CustomError('Failed to get education levels from the database', err)
				);
			});

		return () => {
			fetch = false;
		};
	}, [setEducationLevelsOptions]);

	useEffect(() => {
		let fetch = true;

		LomService.fetchSubjects(map(subjects, 'id'))
			.then((res: Avo.Lom.LomField[]) => {
				fetch && setSubjectsOptions(res);
			})
			.catch((err) => {
				console.error(new CustomError('Failed to get subjects from the database', err));
			});

		return () => {
			fetch = false;
		};
	}, [setSubjectsOptions]);

	useEffect(() => {
		let fetch = true;

		LomService.fetchThemes(map(themes, 'id'))
			.then((res: Avo.Lom.LomField[]) => {
				fetch && setThemesOptions(res);
			})
			.catch((err) => {
				console.error(new CustomError('Failed to get themes from the database', err));
			});

		return () => {
			fetch = false;
		};
	}, [setThemesOptions]);

	const handleEducationLevelsChange = (levels: Avo.Lom.LomField[]) => {
		onChangeEducationLevels(levels);

		if (isEmpty(levels)) {
			onChangeContexts([]);
			return;
		}

		// Check the difference between the chosen edu levels and the newly picked edu levels arrays to find the added or removed edu level
		let newEduLevel = differenceWith(levels, educationLevels, isEqual)[0];
		let added: boolean;
		if (!isEmpty(newEduLevel)) {
			added = true;
		} else {
			newEduLevel = differenceWith(educationLevels, levels, isEqual)[0];
			added = false;
		}

		// Get the full lom field object
		newEduLevel = educationLevelsOptions.find(
			(edu) => edu.id === newEduLevel.id
		) as Avo.Lom.LomField;
		// Get parent lom field
		const parentContext = educationLevelsOptions.find(
			(edu) => edu.id === newEduLevel.parent
		) as Avo.Lom.LomField;

		// Ìf there is a parent lom field , add or remove accordingly
		if (!isNil(parentContext)) {
			if (added) {
				onChangeContexts([...contexts, parentContext]);
			} else {
				onChangeContexts(without([...contexts], parentContext));
			}
		}
	};

	return (
		<Form>
			<Spacer margin="bottom">
				<FormGroup
					label={tText(
						'shared/components/lom-fields-input/lom-fields-input___onderwijsniveau'
					)}
					labelFor="classificationId"
				>
					<TagsInput
						options={mapLomFieldsToOptions(educationLevelsOptions)}
						value={mapLomFieldsToOptions(educationLevels) || []}
						onChange={(value) =>
							handleEducationLevelsChange(mapOptionsToLomFields(value))
						}
					/>
				</FormGroup>

				<FormGroup
					label={tText('shared/components/lom-fields-input/lom-fields-input___vakken')}
					labelFor="subjectId"
				>
					<TagsInput
						options={mapLomFieldsToOptions(subjectsOptions)}
						value={mapLomFieldsToOptions(subjects) || []}
						onChange={(value) => onChangeSubjects(mapOptionsToLomFields(value))}
					/>
				</FormGroup>

				<FormGroup
					label={tText('shared/components/lom-fields-input/lom-fields-input___themas')}
					labelFor="themeId"
				>
					<TagsInput
						options={mapLomFieldsToOptions(themesOptions)}
						value={mapLomFieldsToOptions(themes) || []}
						onChange={(value) => onChangeThemes(mapOptionsToLomFields(value))}
					/>
				</FormGroup>
			</Spacer>
		</Form>
	);
};

export default LomFieldsInput;

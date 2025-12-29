import { type SelectOption, type TagInfo } from '@viaa/avo2-components';
import { AvoLomLomField } from '@viaa/avo2-types';
import { capitalize, compact, isNil } from 'es-toolkit';

export const mapLomFieldsToOptions = (
  lomFields: AvoLomLomField[],
): SelectOption<any>[] => {
  return (lomFields || []).map(
    (lomField) =>
      ({
        value: lomField.id,
        label: capitalize(lomField.label),
      }) as SelectOption<any>,
  );
};

export const mapOptionsToLomFields = (
  options: TagInfo[],
  originalLoms: AvoLomLomField[],
): AvoLomLomField[] => {
  return compact(
    (options || []).map((option) => {
      return originalLoms.find(
        (lom) => lom.id === option.value,
      ) as AvoLomLomField;
    }),
  );
};

export const getParentEducationLevel = (
  loms: AvoLomLomField[],
  allLoms: AvoLomLomField[],
): AvoLomLomField[] => {
  return compact(
    loms.map((lom) => {
      if (isNil(lom.broader)) {
        return null;
      }

      let foundParent: AvoLomLomField | undefined = (allLoms || []).find(
        (edu) => edu.id === lom.broader,
      );

      while (!isNil(foundParent?.broader)) {
        foundParent = (allLoms || []).find(
          (edu) => edu.id === foundParent?.broader,
        );
      }

      return foundParent;
    }),
  );
};

import { Button, Spacer } from '@viaa/avo2-components';
import { AvoCollectionCollection, AvoItemItem, AvoLomLom, AvoLomLomField, } from '@viaa/avo2-types';
import { compact } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import { type FC, useEffect, useState } from 'react';
import { commonUserAtom } from '../../../authentication/authentication.store';
import { CollectionService } from '../../../collection/collection.service';
import { tText } from '../../helpers/translate-text';
import { EducationLevelsField } from '../EducationLevelsField/EducationLevelsField';
import { LomFieldsInput } from '../LomFieldsInput/LomFieldsInput';
import { ShortDescriptionField } from '../ShortDescriptionField/ShortDescriptionField';
import { SubjectsField } from '../SubjectsField/SubjectsField';
import { isShareable } from './QuickLaneContent.helpers';
import { type QuickLaneContentProps, QuickLaneTypeEnum, } from './QuickLaneContent.types';

interface QuickLaneContentPublicationTabProps {
  onComplete?: () => void;
}

export const QuickLaneContentPublicationTab: FC<
  QuickLaneContentProps & QuickLaneContentPublicationTabProps
> = ({ content, content_label, onComplete, onUpdate }) => {
  const commonUser = useAtomValue(commonUserAtom);

  const [model, setModel] = useState(content);
  const isCollection = content_label === QuickLaneTypeEnum.COLLECTION;

  useEffect(() => {
    setModel(content);
  }, [content]);

  const onSubmit = async () => {
    if (commonUser && content && model && isCollection) {
      try {
        const result = await CollectionService.updateCollection(
          content as AvoCollectionCollection,
          {
            ...(model as AvoCollectionCollection),
            is_public: true,
          },
          commonUser,
          true,
          true,
        );

        if (result) {
          onUpdate?.(result);
        } else {
          console.warn(
            'Could not publish collection, validation errors occurred',
          );
        }
        onComplete?.();
      } catch (err) {
        console.error(
          'Could not update publication details of collection',
          err,
        );
      }
    }
  };

  const handleLomsChange = (newLomFields: AvoLomLomField[]) => {
    const newLoms: AvoLomLom[] = newLomFields.map((lomField) => ({
      lom_id: lomField.id,
      lom: lomField,
    }));

    setModel({ ...model, loms: newLoms } as AvoCollectionCollection);
  };

  return model && content && content_label && isCollection ? (
    <>
      {(model as AvoCollectionCollection)?.loms ? (
        <LomFieldsInput
          loms={compact(
            (model as AvoCollectionCollection).loms?.map((lom) => lom.lom) ||
              [],
          )}
          onChange={handleLomsChange}
        />
      ) : (
        <>
          <Spacer margin={'bottom'}>
            <EducationLevelsField
              value={(model as AvoItemItem).lom_context}
              onChange={(levels) => {
                setModel({
                  ...model,
                  lom_context: (levels || []).map((item) =>
                    item.value.toString(),
                  ),
                } as AvoItemItem);
              }}
            />
          </Spacer>
          <Spacer margin={'bottom'}>
            <SubjectsField
              value={(model as AvoItemItem).lom_classification}
              onChange={(subjects) => {
                setModel({
                  ...model,
                  lom_classification: (subjects || []).map((item) =>
                    item.value.toString(),
                  ),
                } as AvoItemItem);
              }}
            />
          </Spacer>
        </>
      )}

      <Spacer margin={'bottom'}>
        <ShortDescriptionField
          value={model.description}
          onChange={(description) => {
            setModel({
              ...model,
              description,
            });
          }}
          placeholder={
            isCollection
              ? tText(
                  'collection/components/collection-or-bundle-edit-meta-data___korte-beschrijving-placeholder-collectie',
                )
              : tText(
                  'collection/components/collection-or-bundle-edit-meta-data___korte-beschrijving-placeholder-bundel',
                )
          }
        />
      </Spacer>
      <Button
        label={
          !isShareable(content)
            ? tText(
                'shared/components/quick-lane-modal/quick-lane-modal-publication-tab___publiceren-en-opslaan',
              )
            : tText(
                'shared/components/quick-lane-modal/quick-lane-modal-publication-tab___opslaan',
              )
        }
        onClick={onSubmit}
      />
    </>
  ) : null;
};

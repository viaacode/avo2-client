import { type RichEditorState } from '@meemoo/react-components';
import {
  Button,
  Column,
  Container,
  Form,
  FormGroup,
  Grid,
  Image,
  Spacer,
  TextArea,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact } from 'es-toolkit';
import { type StringMap } from 'i18next';
import { type FC, useState } from 'react';

import { FileUpload } from '../../shared/components/FileUpload/FileUpload';
import { LomFieldsInput } from '../../shared/components/LomFieldsInput/LomFieldsInput';
import {
  RICH_TEXT_EDITOR_OPTIONS_BUNDLE_DESCRIPTION,
  RICH_TEXT_EDITOR_OPTIONS_DEFAULT_NO_TITLES,
} from '../../shared/components/RichTextEditorWrapper/RichTextEditor.consts';
import { RichTextEditorWrapper } from '../../shared/components/RichTextEditorWrapper/RichTextEditorWrapper';
import { ShortDescriptionField } from '../../shared/components/ShortDescriptionField/ShortDescriptionField';
import { ThumbnailStillsModal } from '../../shared/components/ThumbnailStillsModal/ThumbnailStillsModal';
import { stripHtml } from '../../shared/helpers/formatters/strip-html';
import { tText } from '../../shared/helpers/translate-text';
import { MAX_LONG_DESCRIPTION_LENGTH } from '../collection.const';
import { getValidationFeedbackForDescription } from '../collection.helpers';
import { type CollectionOrBundle } from '../collection.types';

import { type CollectionAction } from './CollectionOrBundleEdit.types';

interface CollectionOrBundleEditMetaDataProps {
  type: CollectionOrBundle;
  collection: Avo.Collection.Collection;
  changeCollectionState: (action: CollectionAction) => void;
  onFocus?: () => void;
}

export const CollectionOrBundleEditMetaData: FC<
  CollectionOrBundleEditMetaDataProps
> = ({ type, collection, changeCollectionState, onFocus }) => {
  // State
  const [isCollectionsStillsModalOpen, setCollectionsStillsModalOpen] =
    useState<boolean>(false);
  const [descriptionLongEditorState, setDescriptionLongEditorState] = useState<
    RichEditorState | undefined
  >(undefined);

  const isCollection = type === 'collection';

  const updateCollectionLoms = (loms: Avo.Lom.LomField[]) => {
    changeCollectionState({
      collectionProp: 'loms',
      type: 'UPDATE_COLLECTION_PROP',
      collectionPropValue: loms.map((lom) => ({ lom }) as Avo.Lom.Lom),
    });
  };

  const handleBlurRichTextEditor = async () => {
    const { sanitizeHtml, SanitizePreset } = await import(
      '@meemoo/admin-core-ui/admin'
    );
    changeCollectionState({
      type: 'UPDATE_COLLECTION_PROP',
      collectionProp: 'description_long',
      collectionPropValue: sanitizeHtml(
        descriptionLongEditorState
          ? descriptionLongEditorState.toHTML()
          : collection.description_long || '',
        SanitizePreset.link,
      ),
    });
  };

  return (
    <>
      <Container mode="vertical">
        <Container mode="horizontal">
          <Form>
            <Spacer margin="bottom">
              <Grid>
                <Column size="3-7">
                  {collection.loms && (
                    <LomFieldsInput
                      loms={compact(collection.loms?.map((lom) => lom.lom))}
                      onChange={updateCollectionLoms}
                      showThemes
                    />
                  )}

                  <ShortDescriptionField
                    value={collection.description}
                    onChange={(value: string) =>
                      changeCollectionState({
                        type: 'UPDATE_COLLECTION_PROP',
                        collectionProp: 'description',
                        collectionPropValue: value,
                      })
                    }
                    placeholder={
                      isCollection
                        ? tText(
                            'collection/components/collection-or-bundle-edit-meta-data___korte-beschrijving-placeholder-collectie',
                          )
                        : tText(
                            'collection/components/collection-or-bundle-edit-meta-data___korte-beschrijving-placeholder-bundel',
                          )
                    }
                    onFocus={onFocus}
                  />
                  {!isCollection && (
                    <FormGroup
                      label={tText(
                        'collection/components/collection-or-bundle-edit-meta-data___beschrijving',
                      )}
                      labelFor="longDescriptionId"
                      error={getValidationFeedbackForDescription(
                        stripHtml(
                          descriptionLongEditorState
                            ? descriptionLongEditorState.toHTML()
                            : collection.description_long || '',
                        ),
                        MAX_LONG_DESCRIPTION_LENGTH,
                        (count) => {
                          return tText(
                            'collection/components/collection-or-bundle-edit-meta-data___de-beschrijving-is-te-lang-count',
                            {
                              count,
                            } as StringMap,
                          );
                        },
                        true,
                      )}
                    >
                      <RichTextEditorWrapper
                        id="longDescriptionId"
                        controls={
                          isCollection
                            ? RICH_TEXT_EDITOR_OPTIONS_DEFAULT_NO_TITLES
                            : RICH_TEXT_EDITOR_OPTIONS_BUNDLE_DESCRIPTION
                        }
                        initialHtml={collection.description_long || ''}
                        state={descriptionLongEditorState}
                        onChange={setDescriptionLongEditorState}
                        onBlur={handleBlurRichTextEditor}
                      />
                      <label>
                        {getValidationFeedbackForDescription(
                          stripHtml(
                            descriptionLongEditorState
                              ? descriptionLongEditorState.toHTML()
                              : collection.description_long || '',
                          ),
                          MAX_LONG_DESCRIPTION_LENGTH,
                          (count) =>
                            tText(
                              'collection/components/collection-or-bundle-edit-meta-data___de-beschrijving-is-te-lang-count',
                              {
                                count,
                              } as StringMap,
                            ),
                        )}
                      </label>
                    </FormGroup>
                  )}
                  <FormGroup
                    label={tText(
                      'collection/views/collection-edit-meta-data___persoonlijke-opmerkingen-notities',
                    )}
                    labelFor="personalRemarkId"
                  >
                    <TextArea
                      name="personalRemarkId"
                      value={collection.note || ''}
                      id="personalRemarkId"
                      height="medium"
                      placeholder={tText(
                        'collection/views/collection-edit-meta-data___geef-hier-je-persoonlijke-opmerkingen-notities-in',
                      )}
                      onChange={(value: string) =>
                        changeCollectionState({
                          type: 'UPDATE_COLLECTION_PROP',
                          collectionProp: 'note',
                          collectionPropValue: value,
                        })
                      }
                      onFocus={onFocus}
                    />
                  </FormGroup>
                </Column>
                <Column size="3-5">
                  <FormGroup
                    label={tText(
                      'collection/views/collection-edit-meta-data___cover-afbeelding',
                    )}
                    labelFor="coverImageId"
                  >
                    {isCollection ? (
                      <>
                        <Button
                          type="secondary"
                          label={tText(
                            'collection/views/collection-edit-meta-data___stel-een-afbeelding-in',
                          )}
                          title={
                            isCollection
                              ? tText(
                                  'collection/components/collection-or-bundle-edit-meta-data___kies-een-afbeelding-om-te-gebruiken-als-de-cover-van-deze-collectie',
                                )
                              : tText(
                                  'collection/components/collection-or-bundle-edit-meta-data___kies-een-afbeelding-om-te-gebruiken-als-de-cover-van-deze-bundel',
                                )
                          }
                          onClick={() => setCollectionsStillsModalOpen(true)}
                        />
                        {collection.thumbnail_path && (
                          <Image
                            className="u-spacer-top"
                            src={collection.thumbnail_path}
                          />
                        )}
                      </>
                    ) : (
                      <FileUpload
                        label={tText(
                          'collection/components/collection-or-bundle-edit-meta-data___upload-een-cover-afbeelding',
                        )}
                        urls={
                          collection.thumbnail_path
                            ? [collection.thumbnail_path]
                            : []
                        }
                        allowMulti={false}
                        assetType="BUNDLE_COVER"
                        ownerId={collection.id}
                        onChange={(urls) =>
                          changeCollectionState({
                            type: 'UPDATE_COLLECTION_PROP',
                            collectionProp: 'thumbnail_path',
                            collectionPropValue: urls[0] || null,
                          })
                        }
                      />
                    )}
                  </FormGroup>
                  {/* TODO: DISABLED FEATURE
											{ isCollection &&
												<FormGroup label={tText('collection/views/collection-edit-meta-data___map')} labelFor="mapId">
													<Button type="secondary" icon={IconName.add} label={tText('collection/views/collection-edit-meta-data___voeg-toe-aan-een-map')} />
												</FormGroup>
											}
										*/}
                </Column>
              </Grid>
            </Spacer>
          </Form>
        </Container>
      </Container>

      <ThumbnailStillsModal
        isOpen={isCollectionsStillsModalOpen}
        onClose={(updated) => {
          setCollectionsStillsModalOpen(false);

          if (collection.thumbnail_path !== updated.thumbnail_path) {
            changeCollectionState({
              type: 'UPDATE_COLLECTION_PROP',
              collectionProp: 'thumbnail_path',
              collectionPropValue: updated.thumbnail_path,
            });
          }
        }}
        subject={collection}
      />
    </>
  );
};

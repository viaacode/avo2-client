import {
  type RichTextEditorControl,
  RichTextEditorWithInternalState,
} from '@meemoo/react-components';
import {
  Alert,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Container,
  convertToHtml,
  ExpandableContainer,
  Form,
  FormGroup,
  IconName,
  Spacer,
  TextInput,
  Toolbar,
  ToolbarItem,
  ToolbarLeft,
  ToolbarRight,
} from '@viaa/avo2-components';

import { clsx } from 'clsx';
import { debounce } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import {
  type FC,
  type LegacyRef,
  type ReactNode,
  useEffect,
  useState,
} from 'react';

import { commonUserAtom } from '../../authentication/authentication.store';
import { ItemVideoDescription } from '../../item/components/ItemVideoDescription';
import { TextWithTimestamps } from '../../shared/components/TextWithTimestamp/TextWithTimestamps';
import { TimeCropControls } from '../../shared/components/TimeCropControls/TimeCropControls';
import { copyToClipboard } from '../../shared/helpers/clipboard';
import { getValidStartAndEnd } from '../../shared/helpers/cut-start-and-end';
import { textToHtmlWithTimestamps } from '../../shared/helpers/formatters/text-to-html-with-timestamps';
import { toSeconds } from '../../shared/helpers/parsers/duration';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { useResizeObserver } from '../../shared/hooks/useResizeObserver';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { embedFlowAtom } from '../../shared/store/ui.store';
import {
  type EmbedCode,
  EmbedCodeDescriptionType,
  EmbedCodeExternalWebsite,
} from '../embed-code.types';
import { toEmbedCodeIFrame } from '../helpers/links';
import { createResource } from '../helpers/resourceForTrackEvents';
import { getValidationErrors } from '../helpers/validationRules';
import { useCreateEmbedCode } from '../hooks/useCreateEmbedCode';

import './EmbedContent.scss';
import { AvoItemItem, AvoUserCommonUser } from '@viaa/avo2-types';

type EmbedProps = {
  item: EmbedCode | null;
  contentDescription: ReactNode | string;
  onSave?: (item: EmbedCode) => void;
  onClose?: () => void;
  onResize?: () => void;
};

export const EmbedContent: FC<EmbedProps> = ({
  item,
  contentDescription,
  onSave,
  onClose,
  onResize,
}) => {
  const fragmentDuration =
    toSeconds((item?.content as AvoItemItem)?.duration) || 0;
  const commonUser = useAtomValue(commonUserAtom);
  const isSmartSchoolEmbedFlow = useAtomValue(embedFlowAtom);

  const [title, setTitle] = useState<string | undefined>();

  const [fragmentStartTime, setFragmentStartTime] = useState<number>(0);
  const [fragmentEndTime, setFragmentEndTime] = useState<number>(0);

  const [start, end] = getValidStartAndEnd(
    fragmentStartTime,
    fragmentEndTime,
    fragmentDuration,
  );

  const [descriptionType, setDescriptionType] =
    useState<EmbedCodeDescriptionType>(EmbedCodeDescriptionType.ORIGINAL);
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    useState<boolean>(false);
  const [customDescription, setCustomDescription] = useState<string>('');
  const [savedEmbedCode, setSavedEmbedCode] = useState<EmbedCode | null>(null);

  const { mutateAsync: createEmbedCode, isPending: isPublishing } =
    useCreateEmbedCode();

  const debouncedEmbedContentResize = debounce(
    () => onResize && onResize(),
    50,
  );
  const embedContentRef = useResizeObserver(() =>
    debouncedEmbedContentResize(),
  );

  const cancelButtonLabel = savedEmbedCode
    ? tText('embed-code/components/embed-content___sluit')
    : tText('embed-code/components/embed-content___annuleer');

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setFragmentStartTime(item.start || 0);
      setFragmentEndTime(item.end || 0);

      setDescriptionType(item.descriptionType);
      setCustomDescription(
        convertToHtml(item.description || item.content.description || ''),
      );

      setSavedEmbedCode(null);
    }
  }, [item]);

  useEffect(() => {
    debouncedEmbedContentResize();
  }, [debouncedEmbedContentResize, isDescriptionExpanded, descriptionType]);

  const mapValuesToEmbedCode = (): EmbedCode => {
    if (!item?.content) {
      return {} as EmbedCode;
    }
    let newDescription = '';

    if (descriptionType === EmbedCodeDescriptionType.ORIGINAL) {
      newDescription = textToHtmlWithTimestamps(item.content.description || '');
    } else if (descriptionType === EmbedCodeDescriptionType.CUSTOM) {
      newDescription = customDescription || '';
    }

    return {
      ...item,
      contentId: (item.content as AvoItemItem).external_id,
      title: title || '',
      start: fragmentStartTime,
      end: fragmentEndTime,
      descriptionType,
      description: newDescription,
    };
  };

  const handleValidation = () => {
    const value = mapValuesToEmbedCode();

    // validate embed before update
    const validationErrors = getValidationErrors(value);

    // display validation errors
    if (validationErrors.length) {
      ToastService.danger(validationErrors);
      return null;
    }
    return value;
  };

  const handleSave = () => {
    const embedToSave = handleValidation();
    embedToSave && onSave && onSave(embedToSave);
  };

  const handleCreate = async () => {
    try {
      const embedToSave = handleValidation();
      if (!embedToSave) {
        return;
      }
      const createdEmbedCode = await createEmbedCode(embedToSave);

      trackEvents(
        {
          object: createdEmbedCode.id,
          object_type: 'embed_code',
          action: 'create',
          resource: {
            ...createResource(
              createdEmbedCode,
              commonUser as AvoUserCommonUser,
            ),
            startedFlow: isSmartSchoolEmbedFlow ? 'SMART_SCHOOL' : 'AVO',
          },
        },
        commonUser,
      );

      if (isSmartSchoolEmbedFlow) {
        window.opener.postMessage(
          [
            {
              title: embedToSave.title,
              url: toEmbedCodeIFrame(createdEmbedCode.id),
            },
          ],
          '*',
        );
        window.close();
        return;
      }

      setSavedEmbedCode(createdEmbedCode);
      ToastService.success(
        tText(
          'embed-code/components/embed-content___je-code-werd-succesvol-aangemaakt-en-opgeslagen-in-je-werkruimte',
        ),
      );
    } catch (err) {
      ToastService.danger(
        tText('embed-code/components/embed-content___code-aanmaken-mislukt'),
      );
    }
  };

  const handleCopyButtonClicked = () => {
    if (!savedEmbedCode) {
      console.error('No embed code to copy');
      ToastService.danger(
        tHtml(
          'embed-code/components/embed-content___het-kopieren-van-de-embed-code-naar-je-klembord-is-mislukt',
        ),
      );
      return;
    }

    trackEvents(
      {
        object: savedEmbedCode.id,
        object_type: 'embed_code',
        action: 'copy',
        resource: {
          ...createResource(savedEmbedCode, commonUser as AvoUserCommonUser),
          pageUrl: window.location.href,
        },
      },
      commonUser,
    );

    copyToClipboard(toEmbedCodeIFrame(savedEmbedCode.id));
    ToastService.success(
      tHtml(
        'embed-code/components/embed-content___de-code-is-naar-je-klembord-gekopieerd',
      ),
    );
  };

  const renderReplacementWarning = () => {
    return (
      item?.contentIsReplaced && (
        <Alert type="danger" className="u-m-b-l">
          {tHtml(
            'embed-code/components/embed-content___dit-fragment-werd-uitzonderlijk-vervangen-door-het-archief-voor-onderwijs-het-zou-kunnen-dat-de-tijdscodes-of-de-beschrijving-niet-meer-goed-passen',
          )}
        </Alert>
      )
    );
  };

  const renderDescription = () => {
    if (
      descriptionType === EmbedCodeDescriptionType.ORIGINAL &&
      !!item?.content?.description
    ) {
      return (
        <div
          className={clsx('original-description', {
            'expandable-container-closed': !isDescriptionExpanded,
          })}
          ref={embedContentRef as LegacyRef<HTMLDivElement>}
        >
          <ExpandableContainer
            collapsedHeight={300}
            defaultExpanded={isDescriptionExpanded}
            onChange={setIsDescriptionExpanded}
          >
            <TextWithTimestamps content={item.content.description || ''} />
          </ExpandableContainer>
        </div>
      );
    }

    if (descriptionType === EmbedCodeDescriptionType.CUSTOM) {
      const controls: RichTextEditorControl[] = [
        'undo',
        'redo',
        'separator',
        'bold',
        'italic',
        'strike-through',
        'underline',
        'separator',
        'remove-styles',
        'separator',
        'text-align',
        'separator',
        'headings',
        'list-ol',
        'list-ul',
        'separator',
        'link',
        'separator',
        'fullscreen',
      ];
      return (
        <RichTextEditorWithInternalState
          controls={controls}
          enabledHeadings={['h3', 'h4', 'normal']}
          value={customDescription || ''}
          disabled={!!savedEmbedCode}
          onChange={setCustomDescription}
        />
      );
    }

    return <></>;
  };

  const renderDescriptionWrapper = () => {
    if (item?.externalWebsite === EmbedCodeExternalWebsite.BOOKWIDGETS) {
      return (
        <Alert type="info">
          <span className="c-content">
            {tHtml(
              'embed-code/components/embed-content___bij-het-insluiten-op-bookwidgets-wordt-er-geen-beschrijving-bij-het-fragment-weergegeven',
            )}
          </span>
        </Alert>
      );
    }

    return (
      <>
        <ButtonGroup className="u-d-flex">
          <Button
            id="share-fragment-use-original-description"
            type="secondary"
            className="u-flex-auto"
            disabled={!!savedEmbedCode}
            label={tText(
              'embed-code/components/embed-content___originele-beschrijving',
            )}
            active={descriptionType === EmbedCodeDescriptionType.ORIGINAL}
            onClick={() =>
              setDescriptionType(EmbedCodeDescriptionType.ORIGINAL)
            }
          />
          <Button
            type="secondary"
            className="u-flex-auto"
            disabled={!!savedEmbedCode}
            label={tText(
              'embed-code/components/embed-content___eigen-beschrijving',
            )}
            active={descriptionType === EmbedCodeDescriptionType.CUSTOM}
            onClick={() => setDescriptionType(EmbedCodeDescriptionType.CUSTOM)}
          />
          <Button
            type="secondary"
            className="u-flex-auto"
            disabled={!!savedEmbedCode}
            label={tText(
              'embed-code/components/embed-content___geen-beschrijving',
            )}
            active={descriptionType === EmbedCodeDescriptionType.NONE}
            onClick={() => setDescriptionType(EmbedCodeDescriptionType.NONE)}
          />
        </ButtonGroup>
        <Spacer margin="top">{renderDescription()}</Spacer>
      </>
    );
  };

  const renderRightSideFooter = () => {
    if (onSave) {
      return (
        <ToolbarRight>
          <ToolbarItem>
            <ButtonToolbar>
              <Button
                type="primary"
                label={tText('embed-code/components/embed-content___opslaan')}
                title={tText('embed-code/components/embed-content___opslaan')}
                ariaLabel={tText(
                  'embed-code/components/embed-content___opslaan',
                )}
                onClick={handleSave}
              />
            </ButtonToolbar>
          </ToolbarItem>
        </ToolbarRight>
      );
    }

    if (savedEmbedCode) {
      return (
        <ToolbarRight>
          <ToolbarItem className="u-truncate">
            {toEmbedCodeIFrame(savedEmbedCode.id)}
          </ToolbarItem>
          <ToolbarItem>
            <ButtonToolbar>
              <Button
                type="primary"
                icon={IconName.copy}
                title={tText(
                  'embed-code/components/embed-content___code-kopieren',
                )}
                ariaLabel={tText(
                  'embed-code/components/embed-content___code-kopieren',
                )}
                onClick={handleCopyButtonClicked}
              />
            </ButtonToolbar>
          </ToolbarItem>
        </ToolbarRight>
      );
    }

    if (isSmartSchoolEmbedFlow) {
      return (
        <ToolbarRight>
          <ToolbarItem>
            <ButtonToolbar>
              <Button
                className="c-button-smartschool"
                icon={IconName.smartschool}
                label={tText(
                  'embed-code/components/embed-content___gebruiken-in-smartschool',
                )}
                ariaLabel={tText(
                  'embed-code/components/embed-content___gebruiken-in-smartschool',
                )}
                title={tText(
                  'embed-code/components/embed-content___gebruiken-in-smartschool',
                )}
                disabled={isPublishing}
                onClick={handleCreate}
              />
            </ButtonToolbar>
          </ToolbarItem>
        </ToolbarRight>
      );
    }

    return (
      <ToolbarRight>
        <ToolbarItem>
          <ButtonToolbar>
            <Button
              type="primary"
              label={tText(
                'embed-code/components/embed-content___code-aanmaken',
              )}
              title={tText(
                'embed-code/components/embed-content___code-aanmaken',
              )}
              ariaLabel={tText(
                'embed-code/components/embed-content___code-aanmaken',
              )}
              disabled={isPublishing}
              onClick={handleCreate}
            />
          </ButtonToolbar>
        </ToolbarItem>
      </ToolbarRight>
    );
  };

  if (!item) {
    return <></>;
  }

  return (
    <div className="embed-content-wrapper">
      <Container mode="vertical" bordered={true} className="u-p-t-0">
        <Form type="standard">
          {renderReplacementWarning()}
          {!isSmartSchoolEmbedFlow && (
            <Spacer margin="bottom-large">{contentDescription}</Spacer>
          )}

          <FormGroup
            required
            label={tText('embed-code/components/embed-content___titel')}
          >
            <TextInput
              value={title}
              onChange={setTitle}
              disabled={!!savedEmbedCode}
            />
          </FormGroup>

          <FormGroup
            label={tText('embed-code/components/embed-content___inhoud')}
            required
          >
            <div className="u-spacer-bottom">
              <ItemVideoDescription
                itemMetaData={{
                  ...(item.content as AvoItemItem),
                  thumbnail_path: item.thumbnailPath,
                }}
                showMetadata={false}
                enableMetadataLink={false}
                showTitle={false}
                showDescription={false}
                canPlay={true}
                cuePointsLabel={{ start, end }}
                cuePointsVideo={{ start, end }}
                trackPlayEvent={false}
              />
            </div>
            <TimeCropControls
              startTime={fragmentStartTime}
              endTime={fragmentEndTime}
              minTime={0}
              maxTime={fragmentDuration}
              disabled={!!savedEmbedCode}
              onChange={(newStartTime: number, newEndTime: number) => {
                const [validStart, validEnd] = getValidStartAndEnd(
                  newStartTime,
                  newEndTime,
                  fragmentDuration,
                );

                const [start_oc, end_oc] = [
                  validStart || 0,
                  validEnd || fragmentDuration,
                ];

                setFragmentStartTime(start_oc);
                setFragmentEndTime(end_oc);
              }}
            />
          </FormGroup>
          <Spacer margin="top-large">{renderDescriptionWrapper()}</Spacer>
        </Form>
      </Container>
      <Toolbar justify className="c-embed-code-content-toolbar">
        <ToolbarLeft>
          <ToolbarItem>
            <ButtonToolbar>
              <Button
                type="secondary"
                label={cancelButtonLabel}
                title={cancelButtonLabel}
                ariaLabel={cancelButtonLabel}
                onClick={onClose}
              />
            </ButtonToolbar>
          </ToolbarItem>
        </ToolbarLeft>
        {renderRightSideFooter()}
      </Toolbar>
    </div>
  );
};

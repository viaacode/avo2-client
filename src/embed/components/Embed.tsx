// eslint-disable-next-line import/no-unresolved
import AvoLogoSrc from '@assets/images/avo-logo-button.svg';
import { Alert, Column, Flex, Grid, Icon, IconName, Spinner, } from '@viaa/avo2-components';

import { noop } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import { type FC, type ReactNode, useCallback, useEffect, useMemo, } from 'react';

import { commonUserAtom } from '../../authentication/authentication.store';
import { toEmbedCodeDetail } from '../../embed-code/helpers/links';
import { createResource } from '../../embed-code/helpers/resourceForTrackEvents';
import { useGetEmbedCode } from '../../embed-code/hooks/useGetEmbedCode';
import { FlowPlayerWrapper } from '../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import { type CustomError } from '../../shared/helpers/custom-error';
import { reorderDate } from '../../shared/helpers/formatters/date';
import { getFlowPlayerPoster } from '../../shared/helpers/get-poster';
import { tHtml } from '../../shared/helpers/translate-html';
import { trackEvents } from '../../shared/services/event-logging-service';

import { EmbedErrorView } from './EmbedErrorView';

import './Embed.scss';
import { AvoItemItem, AvoUserCommonUser } from '@viaa/avo2-types';
import { EmbedCodeContentType } from '../../embed-code/embed-code.types.ts';

export interface EmbedProps {
  embedId: string | null;
  parentPage: string;
  showMetadata: boolean;
  onReload: () => void;
}

export const Embed: FC<EmbedProps> = ({
  embedId,
  showMetadata,
  parentPage,
  onReload,
}) => {
  const commonUser = useAtomValue(commonUserAtom);
  const {
    data: embedCode,
    isLoading: isLoadingEmbedCode,
    isError: isErrorEmbedCode,
    error: embedErrorEmbedCode,
  } = useGetEmbedCode(embedId, true);

  const content = useMemo(() => embedCode?.content as AvoItemItem, [embedCode]);

  const errorInfo = useMemo(() => {
    let errorMessage: ReactNode | string = '';
    let showReloadButton = false;
    let icon: IconName | null = null;

    if (isErrorEmbedCode) {
      if ((embedErrorEmbedCode as CustomError)?.additionalInfo?.errorMessage) {
        errorMessage = (embedErrorEmbedCode as CustomError).additionalInfo
          .errorMessage;
      } else {
        errorMessage = tHtml(
          'embed/components/error-view___oeps-er-liep-iets-mis-probeer-het-opnieuw-br-lukt-het-nog-steeds-niet-dan-is-dit-fragment-mogelijks-verwijderd',
        );
        showReloadButton = true;
      }
    } else if (embedCode && !content) {
      errorMessage = tHtml(
        'embed/components/embed___deze-video-is-niet-meer-beschikbaar',
      );
    } else if (content?.is_deleted) {
      errorMessage = tHtml(
        'embed/components/embed___deze-video-werd-verwijderd',
      );
    } else if (content && !content?.is_published) {
      if (content.depublish_reason) {
        errorMessage = tHtml(
          'embed/components/embed___deze-video-werd-gedepubliceerd-met-volgende-reden',
          {
            depublishReason: content.depublish_reason,
          },
        );
      } else {
        errorMessage = tHtml(
          'embed/components/embed___deze-video-werd-gedepubliceerd',
        );
      }
      icon = IconName.cameraOff;
    }

    if (errorMessage) {
      return { errorMessage, showReloadButton, icon };
    }
    return null;
  }, [content, embedCode, isErrorEmbedCode]);

  const triggerViewEvents = useCallback(async () => {
    if (embedCode && embedCode.contentType === EmbedCodeContentType.item) {
      trackEvents(
        {
          object: embedCode.id,
          object_type: 'embed_code',
          action: 'view',
          resource: {
            ...createResource(embedCode, commonUser as AvoUserCommonUser),
            parentPage,
          },
        },
        commonUser,
      );
    }
  }, [commonUser, embedCode]);

  useEffect(() => {
    if (embedCode) {
      triggerViewEvents().then(noop);
    }
  }, [embedCode, triggerViewEvents]);

  const onPlay = () => {
    if (!embedCode) {
      return;
    }
    trackEvents(
      {
        object: embedCode.id,
        object_type: 'embed_code',
        action: 'play',
        resource: {
          ...createResource(embedCode, commonUser as AvoUserCommonUser),
          parentPage,
        },
      },
      commonUser,
    );
  };

  const trackViewEmbedLinkClicked = () => {
    if (!embedCode) {
      return;
    }
    trackEvents(
      {
        object: embedCode.id,
        object_type: 'embed_code',
        action: 'request',
        resource: {
          ...createResource(embedCode, commonUser as AvoUserCommonUser),
          parentPage,
        },
      },
      commonUser,
    );
  };

  if (errorInfo) {
    return (
      <EmbedErrorView
        message={errorInfo.errorMessage}
        onReload={errorInfo.showReloadButton ? onReload : null}
        icon={errorInfo.icon}
      />
    );
  }

  if (isLoadingEmbedCode || !embedCode) {
    return (
      <Flex center style={{ height: '100%' }}>
        <Spinner size="large" />
      </Flex>
    );
  }

  return (
    <>
      <div className="embed-wrapper">
        {embedCode.contentIsReplaced && (
          <Alert type="danger">
            {tHtml(
              'embed/components/embed___dit-fragment-werd-uitzonderlijk-vervangen-door-het-archief-voor-onderwijs-het-zou-kunnen-dat-de-tijdscodes-of-de-beschrijving-niet-meer-goed-passen-meld-dit-aan-de-lesgever-die-het-fragment-aanmaakte',
            )}
          </Alert>
        )}
        <div className="c-video-player">
          <FlowPlayerWrapper
            poster={
              embedCode?.thumbnailPath ||
              getFlowPlayerPoster(undefined, content)
            }
            item={{
              ...content,
              thumbnail_path: embedCode.thumbnailPath,
            }}
            canPlay={true}
            placeholder={false}
            cuePointsLabel={{ start: embedCode.start, end: embedCode.end }}
            cuePointsVideo={{ start: embedCode.start, end: embedCode.end }}
            onPlay={onPlay}
            // Not tracking the playevent in the FlowPlayer since that is bound to the item and not an embed
            trackPlayEvent={false}
          />

          <div className="c-custom-logo-overlay">
            <img src={content?.organisation?.logo_url} />
          </div>
        </div>

        {showMetadata && (
          <div className="c-embed-metadata">
            <p
              className="c-h3 u-spacer-top-s u-m-b-0 u-truncate"
              title={embedCode.title}
            >
              {embedCode.title}
            </p>

            <Grid noWrap>
              <Column size="flex">
                <p className="c-meta-data">
                  <span>{tHtml('embed/components/embed___aanbieder')}</span>
                  <span
                    className="u-text-bold u-truncate"
                    title={content?.organisation?.name}
                  >
                    {content?.organisation?.name}
                  </span>
                  <span className="u-text-bold">&bull;</span>
                  <span>{tHtml('embed/components/embed___uitgezonden')}</span>
                  <span
                    className="u-text-bold"
                    title={reorderDate(content?.issued, '/')}
                  >
                    {reorderDate(content?.issued, '/')}
                  </span>
                </p>
                <p className="c-meta-data">
                  <span>{tHtml('embed/components/embed___reeks')}</span>
                  <span
                    className="u-text-bold u-truncate"
                    title={content?.series}
                  >
                    {content?.series}
                  </span>
                </p>
              </Column>
              <Column size="static">
                <a
                  className="c-avo-button"
                  href={toEmbedCodeDetail(embedCode?.id)}
                  target="_blank"
                  onClick={trackViewEmbedLinkClicked}
                  rel="noreferrer"
                >
                  <img
                    className="c-avo-logo"
                    alt="Archief voor Onderwijs logo"
                    src={AvoLogoSrc}
                  />
                  <Icon name={IconName.externalLink} subtle />
                </a>
              </Column>
            </Grid>
          </div>
        )}
      </div>
    </>
  );
};

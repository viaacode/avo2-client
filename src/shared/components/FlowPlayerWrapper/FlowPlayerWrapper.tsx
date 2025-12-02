import './FlowPlayerWrapper.scss';
import {
  FlowPlayer,
  type FlowplayerSourceItem,
  type FlowplayerSourceList,
} from '@meemoo/react-components';
import {
  Icon,
  IconName,
  MediaCard,
  MediaCardThumbnail,
  Thumbnail,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { isNil, isString, throttle } from 'es-toolkit';
import { useAtomValue, useSetAtom } from 'jotai';
import { stringifyUrl } from 'query-string';
import React, {
  type FC,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page';
import { APP_PATH } from '../../../constants';
import { CustomError } from '../../helpers/custom-error';
import { getValidStartAndEnd } from '../../helpers/cut-start-and-end';
import { getEnv } from '../../helpers/env';
import { reorderDate } from '../../helpers/formatters/date';
import { formatDurationHoursMinutesSeconds } from '../../helpers/formatters/duration';
import { getSubtitles } from '../../helpers/get-subtitles';
import { isMobileWidth } from '../../helpers/media-query';
import { toSeconds } from '../../helpers/parsers/duration';
import { useQueryParam } from '../../helpers/routing/use-query-params-ssr';
import { tHtml } from '../../helpers/translate-html';
import { tText } from '../../helpers/translate-text';
import { BookmarksViewsPlaysService } from '../../services/bookmarks-views-plays-service/bookmarks-views-plays-service';
import { trackEvents } from '../../services/event-logging-service';
import { fetchPlayerTicket } from '../../services/player-ticket-service';
import { ToastService } from '../../services/toast-service';
import { lastVideoPlayedAtAtom } from '../../store/ui.store';
import { type FlowPlayerWrapperProps } from './FlowPlayerWrapper.types';

/**
 * Handle flowplayer play events for the whole app, so we track play count
 * @param placeholder
 * @param props
 * @constructor
 */
export const FlowPlayerWrapper: FC<FlowPlayerWrapperProps> = ({
  placeholder = true,
  ...props
}) => {
  const navigateFunc = useNavigate();

  const commonUser = useAtomValue(commonUserAtom);
  const setLastVideoPlayedAt = useSetAtom(lastVideoPlayedAtAtom);

  const item: Avo.Item.Item | undefined = props.item;
  const poster: string | undefined = props.poster || item?.thumbnail_path;

  const [triggeredForUrl, setTriggeredForUrl] = useState<
    Record<string, boolean>
  >({});

  // AVO-2241:
  // The flowplayer play event is created from outside react, so to be able to update the state, we need to use a ref.
  // see: https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559
  const triggeredForUrlRef = React.useRef(triggeredForUrl);
  const setTriggeredForUrlRef = (data: Record<string, boolean>) => {
    triggeredForUrlRef.current = data;
    setTriggeredForUrl(data);
  };

  const [clickedThumbnail, setClickedThumbnail] = useState<boolean>(false);
  const [src, setSrc] = useState<string | FlowplayerSourceList | undefined>(
    props.src,
  );

  const isPlaylist = !isString(src) && !isNil(src);

  const [autoplayVideo] = useQueryParam('autoplayVideo');

  useEffect(() => {
    // reset token when item changes
    setSrc(props.src);
    setClickedThumbnail(false);
  }, [item, props.src, setSrc, setClickedThumbnail]);

  const initFlowPlayer = useCallback(async () => {
    try {
      if (!item && !props.src) {
        throw new CustomError(
          'Failed to init flowplayer since item is undefined',
        );
      }
      if (item) {
        setSrc(await fetchPlayerTicket(item.external_id));
      }
    } catch (err) {
      console.error(
        new CustomError('Failed to initFlowPlayer in FlowPlayerWrapper', err, {
          item,
        }),
      );
      ToastService.danger(
        tHtml(
          'item/components/item-video-description___het-ophalen-van-de-mediaplayer-ticket-is-mislukt',
        ),
      );
    }
  }, [item, setSrc]);

  useEffect(() => {
    if (
      item &&
      (props.autoplay || !placeholder || autoplayVideo === item.external_id)
    ) {
      initFlowPlayer();
    }
  }, [props.autoplay, autoplayVideo, item, initFlowPlayer, placeholder]);

  const handlePlay = (playingSrc: string) => {
    setClickedThumbnail(true);

    // Only trigger once per video
    if (
      item &&
      item.uid &&
      item.external_id &&
      !triggeredForUrlRef.current[playingSrc] &&
      commonUser &&
      props.trackPlayEvent
    ) {
      BookmarksViewsPlaysService.action(
        'play',
        'item',
        item.uid,
        commonUser,
      ).catch((err: unknown) => {
        console.error(
          new CustomError('Failed to track item play event', err, {
            itemUuid: item.uid,
          }),
        );
      });
      trackEvents(
        {
          object: item.external_id,
          object_type: 'item',
          action: 'play',
        },
        commonUser,
      );

      if (props.onPlay) {
        props.onPlay(playingSrc);
      }

      setTriggeredForUrlRef({
        ...triggeredForUrl,
        [playingSrc]: true,
      });
    } else if (!triggeredForUrlRef.current[playingSrc] && props.onPlay) {
      props.onPlay(playingSrc);

      setTriggeredForUrlRef({
        ...triggeredForUrl,
        [playingSrc]: true,
      });
    }
  };

  const handleTimeUpdate = throttle(
    () => {
      // Keep track of the last time a video was played in the redux store
      // Since it influences when we want to show the "you are inactive" modal for editing collections and assignments
      // https://meemoo.atlassian.net/browse/AVO-2983
      setLastVideoPlayedAt(new Date());
    },
    30000,
    { edges: ['leading', 'trailing'] },
  );

  const handlePosterClicked = async (evt: MouseEvent<HTMLDivElement>) => {
    setClickedThumbnail(true);

    if (!src) {
      if (!commonUser) {
        const anchorId = evt.currentTarget
          .closest('[data-anchor]')
          ?.getAttribute('data-anchor');
        redirectToClientPage(
          stringifyUrl({
            url: APP_PATH.REGISTER_OR_LOGIN.route,
            query: {
              // Scroll back down to this video player: https://meemoo.atlassian.net/browse/AVO-3171
              returnToUrl: stringifyUrl({
                url: location.pathname + (anchorId ? '#' + anchorId : ''),
                query: {
                  autoplayVideo: item?.external_id,
                },
              }),
            },
          }),
          navigateFunc,
        );
        return;
      }
      await initFlowPlayer();
    }
  };

  const hasHlsSupport = (): boolean => {
    try {
      new MediaSource();

      return true;
    } catch (err) {
      return false;
    }
  };

  const renderPlaylistTile = (item: FlowplayerSourceItem): ReactNode => {
    return (
      <MediaCard
        title={item.title}
        orientation="vertical"
        category={Avo.ContentType.English.SEARCH} // Clearest color on white background
      >
        <MediaCardThumbnail>
          <Thumbnail
            category={item.category}
            src={item.poster}
            meta={item.provider}
            label={item.category}
          />
        </MediaCardThumbnail>
      </MediaCard>
    );
  };

  const getBrowserSafeUrl = (
    src: string | FlowplayerSourceList,
  ): string | FlowplayerSourceList => {
    if (hasHlsSupport()) {
      return src;
    }

    if (isPlaylist) {
      // Convert each url in the entry in the playlist if possible
      (src as FlowplayerSourceList).items.forEach((entry) => {
        if (entry.src.includes('flowplayer')) {
          entry.src = entry.src
            .replace('/hls/', '/v-')
            .replace('/playlist.m3u8', '_original.mp4');
        }
      });

      if (
        (src as FlowplayerSourceList).items.some((entry) =>
          entry.src.includes('.m3u8'),
        )
      ) {
        ToastService.danger(
          tHtml(
            'shared/components/flow-player-wrapper/flow-player-wrapper___bepaalde-videos-in-de-playlist-kunnen-niet-worden-afgespeeld-probeer-een-andere-browser',
          ),
        );
      }
    } else {
      // Convert src url
      if ((src as string).includes('flowplayer')) {
        return (src as string)
          .replace('/hls/', '/v-')
          .replace('/playlist.m3u8', '_original.mp4');
      }

      if ((src as string).endsWith('.m3u8')) {
        ToastService.danger(
          tHtml(
            'shared/components/flow-player-wrapper/flow-player-wrapper___deze-video-kan-niet-worden-afgespeeld-probeer-een-andere-browser',
          ),
        );
      }
    }

    return src;
  };

  const [start, end]: [number | null, number | null] = getValidStartAndEnd(
    props.cuePointsVideo?.start,
    props.cuePointsVideo?.end,
    toSeconds(item?.duration),
  );

  const trackingId =
    window.ga && typeof window.ga.getAll === 'function' && window.ga.getAll()[0]
      ? window.ga.getAll()[0].get('trackingId')
      : undefined;

  const renderCutOverlay = () => {
    return (
      !isNil(start) &&
      !isNil(end) &&
      (start !== 0 || end !== toSeconds(item?.duration)) && (
        <div className="c-cut-overlay">
          <Icon name={IconName.scissors} />
          {`${formatDurationHoursMinutesSeconds(
            start,
          )} - ${formatDurationHoursMinutesSeconds(end)}`}
        </div>
      )
    );
  };

  return (
    <>
      <div
        className="c-video-player t-player-skin--dark"
        style={isPlaylist ? {} : { aspectRatio: '16/9' }}
      >
        {src &&
        (props.autoplay ||
          !placeholder ||
          clickedThumbnail ||
          !item ||
          autoplayVideo === item?.external_id) ? (
          <>
            <FlowPlayer
              src={getBrowserSafeUrl(src)}
              type={
                (item?.type?.label as 'video' | 'audio' | undefined) || 'video'
              }
              poster={poster}
              title={props.title}
              metadata={
                item
                  ? [
                      props.issuedDate || reorderDate(item.issued || null, '.'),
                      item?.organisation?.name || '',
                    ]
                  : undefined
              }
              token={getEnv('FLOW_PLAYER_TOKEN')}
              dataPlayerId={getEnv('FLOW_PLAYER_ID')}
              logo={
                item?.organisation?.overlay
                  ? item?.organisation?.logo_url
                  : undefined
              }
              speed={
                props.speed === null
                  ? undefined
                  : {
                      options: [0.5, 0.75, 1, 1.25, 1.5],
                      labels: [
                        tText(
                          'shared/components/flow-player-wrapper/flow-player-wrapper___0-5',
                        ),
                        tText(
                          'shared/components/flow-player-wrapper/flow-player-wrapper___0-75',
                        ),
                        tText(
                          'shared/components/flow-player-wrapper/flow-player-wrapper___normaal',
                        ),
                        tText(
                          'shared/components/flow-player-wrapper/flow-player-wrapper___1-25',
                        ),
                        tText(
                          'shared/components/flow-player-wrapper/flow-player-wrapper___1-5',
                        ),
                      ],
                    }
              }
              start={item ? start : null}
              end={item ? end : null}
              autoplay={
                !placeholder
                  ? false
                  : (!!item && !!src) || (!isPlaylist && props.autoplay)
              }
              canPlay={props.canPlay}
              subtitles={getSubtitles(item)}
              playlistScrollable={!isMobileWidth()}
              onPlay={handlePlay}
              onEnded={props.onEnded}
              onTimeUpdate={handleTimeUpdate}
              googleAnalyticsId={trackingId}
              googleAnalyticsEvents={
                [
                  'video_player_load',
                  'video_start',
                  'video_click_play',
                  'video_25_percent',
                  'video_50_percent',
                  'video_75_percent',
                  'video_complete',
                ] as any
              }
              googleAnalyticsTitle={props.title}
              renderPlaylistTile={renderPlaylistTile}
              seekable={props.seekable}
              ui={props.ui}
              controls={props.controls}
              enableRestartCuePointsButton={true}
            />

            {!placeholder && !clickedThumbnail && renderCutOverlay()}
          </>
        ) : (
          // Fake player for logged-out users that do not yet have video playback rights
          <div
            className="c-video-player__overlay c-video-player__item c-video-player__thumbnail"
            onClick={handlePosterClicked}
            style={{ aspectRatio: '16/9', backgroundImage: `url(${poster})` }}
          >
            <div className="c-play-overlay">
              <div className="c-play-overlay__inner">
                <Icon name={IconName.play} className="c-play-overlay__button" />
              </div>
            </div>
            {renderCutOverlay()}
            {!!props.topRight && (
              <div className="c-video-player__top-right">{props.topRight}</div>
            )}
          </div>
        )}
      </div>

      {(!!props.annotationTitle || !!props.annotationText) && (
        <div className="a-block-image__annotation">
          {props.annotationTitle && <h3>{props.annotationTitle}</h3>}
          {props.annotationText && (
            <p className="a-flowplayer__text">{props.annotationText}</p>
          )}
        </div>
      )}
    </>
  );
};

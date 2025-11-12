import {
  Avatar,
  Box,
  Button,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Spacer,
  TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type AssignmentLayout } from '../../../assignment/assignment.types';
import { commonUserAtom } from '../../../authentication/authentication.store';
import { ItemVideoDescription } from '../../../item/components/ItemVideoDescription';
import { QuickLaneService } from '../../../quick-lane/quick-lane.service';
import { getValidStartAndEnd } from '../../helpers/cut-start-and-end';
import { copyQuickLaneToClipboard } from '../../helpers/generate-quick-lane-href';
import { isMobileWidth } from '../../helpers/media-query';
import { toSeconds } from '../../helpers/parsers/duration';
import { tHtml } from '../../helpers/translate-html';
import { tText } from '../../helpers/translate-text';
import { useDebounce } from '../../hooks/useDebounce';
import { ToastService } from '../../services/toast-service';
import { type QuickLaneUrlObject } from '../../types/index';
import { ContentLink } from '../ContentLink/ContentLink';
import { LayoutOptions } from '../LayoutOptions/LayoutOptions';
import { QuickLaneLink } from '../QuickLaneLink/QuickLaneLink';
import { TimeCropControls } from '../TimeCropControls/TimeCropControls';
import {
  defaultQuickLaneState,
  getContentUuid,
  isShareable,
} from './QuickLaneContent.helpers';
import {
  type QuickLaneContentProps,
  QuickLaneTypeEnum,
} from './QuickLaneContent.types';

export const QuickLaneContentSharingTab: FC<QuickLaneContentProps> = ({
  isOpen,
  content,
  content_label,
}) => {
  const commonUser = useAtomValue(commonUserAtom);

  const fragmentDuration = useMemo(
    () => toSeconds((content as Avo.Item.Item).duration) || 0,
    [content],
  );

  const [quickLane, setQuickLane] = useState<QuickLaneUrlObject>(
    defaultQuickLaneState,
  );
  const [exists, setExists] = useState<boolean>(false);
  const [synced, setSynced] = useState<boolean>(false);

  const initialFragmentStart = useMemo(() => {
    return quickLane.start_oc || 0;
  }, [quickLane]);

  const initialFragmentEnd = useMemo(() => {
    return quickLane.end_oc || fragmentDuration;
  }, [quickLane, fragmentDuration]);

  const [fragmentStartTime, setFragmentStartTime] =
    useState<number>(initialFragmentStart);
  const [fragmentEndTime, setFragmentEndTime] =
    useState<number>(initialFragmentEnd);

  const debounced = useDebounce(quickLane, 500);

  const resetState = useCallback(() => {
    setQuickLane(defaultQuickLaneState);

    setExists(false);
    setSynced(false);

    setFragmentStartTime(initialFragmentStart);
    setFragmentEndTime(initialFragmentEnd);
  }, [initialFragmentEnd, initialFragmentStart]);

  // If the Content is open and we haven't checked if anything exists, fetch or create the record
  useEffect(() => {
    if (exists) {
      return;
    }

    (async () => {
      if (isOpen && content && content_label) {
        if (commonUser?.profileId) {
          let items = await QuickLaneService.fetchQuickLanesByContentAndOwnerId(
            getContentUuid(content, content_label),
            content_label,
            commonUser.profileId,
          );

          if (items.length === 0 && isShareable(content)) {
            items = await QuickLaneService.insertQuickLanes([
              {
                // Initialise with content title
                ...quickLane,
                title: content.title as string,
                content_label,
                content_id: getContentUuid(content, content_label),
                owner_profile_id: commonUser.profileId,
                end_oc: fragmentDuration,
              },
            ]);

            ToastService.success(
              tHtml(
                'shared/components/quick-lane-modal/quick-lane-modal___je-gedeelde-link-is-succesvol-aangemaakt',
              ),
            );
          }

          if (items.length === 1) {
            const item = {
              ...quickLane,
              ...items[0],
            };

            setQuickLane(item);
            setFragmentStartTime(item.start_oc || 0);
            setFragmentEndTime(item.end_oc || fragmentDuration);

            setExists(true);
            setSynced(true);
          }
        }
      }
    })();
  }, [content, exists, isOpen]);

  // When debounced changes occur, synchronise the changes with the database
  useEffect(() => {
    const object = debounced as QuickLaneUrlObject;

    if (!exists || object.id.length <= 0) {
      return;
    }

    (async () => {
      // Ignore the first change after sync
      if (synced) {
        setSynced(false);
      } else if (content && content_label) {
        if (commonUser?.profileId) {
          const updated = await QuickLaneService.updateQuickLaneById(
            object.id,
            {
              ...object,
              content_label,
              content_id: getContentUuid(content, content_label),
              owner_profile_id: commonUser.profileId,
            },
          );

          if (updated.length === 1) {
            setSynced(true);
            setQuickLane({
              ...object,
              ...updated[0],
            });

            ToastService.success(
              tHtml(
                'shared/components/quick-lane-modal/quick-lane-modal___je-gedeelde-link-is-succesvol-aangepast',
              ),
            );
          }
        }
      }
    })();
  }, [debounced]);

  // Ensure end_oc is never exactly 0
  useEffect(() => {
    if (quickLane.end_oc === 0 && fragmentDuration !== 0) {
      setQuickLane({ ...quickLane, end_oc: fragmentDuration });
      setFragmentEndTime(fragmentDuration);
      setSynced(false);
    }
  }, [quickLane, fragmentDuration]);

  // Ensure a clean slate when opening other Contents
  useEffect(() => {
    if (isOpen) return;
    resetState();
  }, [isOpen, resetState]);

  const avatar = {
    name: commonUser?.organisation?.name,
    image: commonUser?.organisation?.logo_url,
  };

  const [start, end] = getValidStartAndEnd(
    fragmentStartTime,
    fragmentEndTime,
    fragmentDuration,
  );

  return commonUser && content && content_label ? (
    <Form type="standard">
      {(avatar.name || avatar.image) && (
        <Spacer margin={['bottom']}>
          <Avatar
            className="m-quick-lane-content__avatar"
            dark={true}
            name={avatar.name}
            image={avatar.image}
          />
        </Spacer>
      )}

      <Spacer margin={['bottom']}>
        <FormGroup
          required
          label={tText(
            'shared/components/quick-lane-modal/quick-lane-modal___titel',
          )}
        >
          <TextInput
            id="title"
            disabled={!quickLane.id}
            value={quickLane.title}
            onChange={(title: string) =>
              setQuickLane({
                ...quickLane,
                title,
              })
            }
          />
        </FormGroup>
      </Spacer>

      <Spacer margin={['bottom']}>
        <FormGroup
          label={tText(
            'shared/components/quick-lane-modal/quick-lane-modal___inhoud',
          )}
        >
          {content_label === QuickLaneTypeEnum.COLLECTION && (
            <ContentLink
              parent={{
                content_label,
                content_id: `${content.id}`,
              }}
              content={content}
            />
          )}
          {content_label === QuickLaneTypeEnum.ITEM && (
            <>
              <div className="u-spacer-bottom">
                <ItemVideoDescription
                  itemMetaData={content as Avo.Item.Item}
                  showMetadata={false}
                  enableMetadataLink={false}
                  showTitle={false}
                  showDescription={false}
                  canPlay={isOpen}
                  cuePointsLabel={{ start, end }}
                  cuePointsVideo={{ start, end }}
                  verticalLayout={isMobileWidth()}
                  trackPlayEvent={false}
                />
              </div>
              <TimeCropControls
                startTime={fragmentStartTime}
                endTime={fragmentEndTime}
                minTime={0}
                maxTime={fragmentDuration}
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

                  setQuickLane({
                    ...quickLane,
                    start_oc,
                    end_oc,
                  });

                  if (
                    start_oc !== fragmentStartTime ||
                    end_oc !== fragmentEndTime
                  ) {
                    setSynced(false);
                  }
                }}
              />
            </>
          )}
        </FormGroup>
      </Spacer>

      <Spacer margin={['bottom']}>
        <FormGroup
          label={tText(
            'shared/components/quick-lane-modal/quick-lane-modal___weergave-voor-leerlingen',
          )}
        >
          <LayoutOptions
            item={{ content_layout: quickLane.view_mode }}
            disabled={!quickLane.id}
            onChange={(value: string) => {
              setQuickLane({
                ...quickLane,
                view_mode: value as unknown as AssignmentLayout, // TS2353
              });
            }}
          />
        </FormGroup>
      </Spacer>

      <Spacer margin={['bottom']}>
        <Box backgroundColor="gray" condensed>
          <Flex wrap justify="between" align="baseline">
            <FlexItem className="u-truncate m-quick-lane-modal__link">
              {quickLane.id && <QuickLaneLink id={quickLane.id} />}
            </FlexItem>
            <FlexItem shrink>
              <Spacer margin="left-small">
                <Button
                  disabled={!quickLane.id}
                  label={tText(
                    'shared/components/quick-lane-modal/quick-lane-modal___kopieer-link',
                  )}
                  onClick={() => copyQuickLaneToClipboard(quickLane.id)}
                />
              </Spacer>
            </FlexItem>
          </Flex>
        </Box>
      </Spacer>
    </Form>
  ) : null;
};

import { AvoItemItem, AvoUserCommonUser } from '@viaa/avo2-types';
import { type MinimalClientEvent } from '../../shared/services/event-logging-service';
import { type EmbedCode } from '../embed-code.types';

export function createResource(
  embedCode: EmbedCode,
  commonUser: AvoUserCommonUser,
): MinimalClientEvent['resource'] {
  const content = embedCode?.content as AvoItemItem;
  const userGroup = commonUser.userGroup;

  return {
    // User related
    profileId: commonUser?.profileId || '',
    userGroup: userGroup?.label || userGroup?.id || '',

    // Content related
    pidVideo: content.external_id,
    organisation: content.organisation?.name,

    // Embed code related
    externalWebsite: embedCode.externalWebsite,
  };
}

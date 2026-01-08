import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client';

import { AvoUserCommonUser } from '@viaa/avo2-types';
import { compact } from 'es-toolkit';
import { stringifyUrl } from 'query-string';
import { CustomError } from '../helpers/custom-error';
import { getEnv } from '../helpers/env';
import { type MinimalClientEvent, trackEvents } from './event-logging-service';

export type EmailTemplateType = 'item' | 'collection' | 'bundle';

enum NewsletterPreferenceKey {
  newsletter = 'newsletter',
  ambassador = 'ambassador',
}

// TODO replace withAvoNewsletterPreferences when typings v2.49.5 is released together with proxy v1.26.0 (rondje 3)
export type NewsletterPreferences = Record<NewsletterPreferenceKey, boolean>;

export class CampaignMonitorService {
  public static async fetchNewsletterPreferences(
    preferenceCenterKey?: string,
  ): Promise<NewsletterPreferences> {
    try {
      return fetchWithLogoutJson<NewsletterPreferences>(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/campaign-monitor/preferences`,
          query: {
            preferenceCenterKey,
          },
        }),
      );
    } catch (err) {
      throw new CustomError('Failed to fetch newsletter preferences', err);
    }
  }

  /**
   * Create or update the user in Campaign Monitor with the given preferences
   * @param preferences  if null => no change to the newsletter preferences, but do create the user if they don't exist yet
   * @param preferenceCenterKey
   */
  public static async updateNewsletterPreferences(
    preferences: Partial<NewsletterPreferences> | null,
    preferenceCenterKey?: string,
  ) {
    try {
      await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/campaign-monitor/preferences`,
        {
          method: 'POST',
          body: JSON.stringify({ preferences, preferenceCenterKey }),
        },
      );
    } catch (err) {
      throw new CustomError('Failed to update newsletter preferences', err, {
        preferences,
      });
    }
  }

  /**
   * Add an event for each subscribe or unsubscribe from a campaign monitor list to the events logging database
   * @param oldNewsletterPreferences
   * @param newNewsletterPreferences
   * @param commonUser
   * @param preferenceCenterKey
   */
  public static async triggerEventsForNewsletterPreferences(
    oldNewsletterPreferences: Partial<NewsletterPreferences>,
    newNewsletterPreferences: Partial<NewsletterPreferences>,
    commonUser: AvoUserCommonUser | undefined,
    preferenceCenterKey: string | undefined | null,
  ) {
    if (!commonUser) {
      return;
    }
    const events: MinimalClientEvent[] = compact(
      Object.values(NewsletterPreferenceKey).map(
        (key): MinimalClientEvent | null => {
          if (oldNewsletterPreferences[key] !== newNewsletterPreferences[key]) {
            if (newNewsletterPreferences[key] === true) {
              // subscribed
              return {
                action: 'add',
                object: commonUser.profileId,
                object_type: 'profile',
                resource: {
                  id: key,
                  type: 'campaign-monitor-list',
                  ...(preferenceCenterKey ? { preferenceCenterKey } : {}),
                },
              };
            } else if (newNewsletterPreferences[key] === false) {
              // unsubscribed
              return {
                action: 'remove',
                object: commonUser.profileId,
                object_type: 'profile',
                resource: {
                  id: key,
                  type: 'campaign-monitor-list',
                  ...(preferenceCenterKey ? { preferenceCenterKey } : {}),
                },
              };
            }
          }
          return null;
        },
      ),
    );
    await trackEvents(events, commonUser);
  }

  public static async shareThroughEmail(
    email: string,
    title: string,
    link: string,
    type: EmailTemplateType,
  ): Promise<void> {
    let url: string | undefined;
    let body: any;
    try {
      url = `${getEnv('PROXY_URL')}/campaign-monitor/send`;
      body = {
        to: email,
        template: type,
        data: {
          mainLink: link,
          mainTitle: title,
        },
      };

      await fetchWithLogoutJson(url, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new CustomError('Failed to get player ticket', err, {
        email,
        title,
        link,
        type,
        url,
        body,
      });
    }
  }
}

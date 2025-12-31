import { type ContentPageInfo } from '@meemoo/admin-core-ui/admin';
import { isAfter, isBefore, isWithinInterval } from 'date-fns';

export function getPublishedDate(
  contentPage: Partial<ContentPageInfo> | undefined | null,
): string | null {
  if (!contentPage) {
    return null;
  }

  const { isPublic, publishedAt, publishAt, depublishAt } = contentPage;

  if (isPublic && publishedAt) {
    return publishedAt;
  }

  if (publishAt && depublishAt) {
    if (
      isWithinInterval(new Date(), {
        start: new Date(publishAt),
        end: new Date(depublishAt),
      })
    ) {
      return publishAt;
    }
    return null;
  }

  if (publishAt) {
    if (isAfter(new Date(), new Date(publishAt))) {
      return publishAt;
    }
    return null;
  }

  if (depublishAt) {
    if (isBefore(new Date(), new Date(depublishAt))) {
      return new Date().toISOString();
    }
    return null;
  }

  return null;
}

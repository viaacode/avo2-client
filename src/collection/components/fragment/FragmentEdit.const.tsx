import {
  AvoCoreBlockItemType,
  AvoEventLoggingObjectType,
} from '@viaa/avo2-types';
import { type ReactNode } from 'react';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';

export const COLLECTION_FRAGMENT_TYPE_TO_EVENT_OBJECT_TYPE: Partial<
  Record<AvoCoreBlockItemType, AvoEventLoggingObjectType>
> = {
  [AvoCoreBlockItemType.ITEM]: 'item',
  [AvoCoreBlockItemType.COLLECTION]: 'collection',
  [AvoCoreBlockItemType.ASSIGNMENT]: 'assignment',
};

export function GET_FRAGMENT_DELETE_SUCCESS_MESSAGES(): Record<
  AvoCoreBlockItemType,
  ReactNode
> {
  return {
    TEXT: tHtml(
      'collection/components/fragment/fragment-edit___tekst-is-succesvol-verwijderd-uit-de-collectie',
    ),
    ITEM: tHtml(
      'collection/components/fragment/fragment-edit___fragment-is-succesvol-verwijderd-uit-de-collectie',
    ),
    ZOEK: tHtml(
      'collection/components/fragment/fragment-edit___zoek-blok-is-succesvol-verwijderd-uit-de-collectie',
    ),
    BOUW: tHtml(
      'collection/components/fragment/fragment-edit___zoek-blok-is-succesvol-verwijderd-uit-de-collectie',
    ),
    COLLECTION: tHtml(
      'collection/components/fragment/fragment-edit___collectie-is-succesvol-verwijderd-uit-de-bundel',
    ),
    ASSIGNMENT: tHtml(
      'collection/components/fragment/fragment-edit___opdracht-is-succesvol-verwijderd-uit-de-bundel',
    ),
  };
}

export function GET_FRAGMENT_DELETE_LABELS(): Record<
  AvoCoreBlockItemType,
  string
> {
  return {
    ITEM: tText(
      'collection/components/fragment/fragment-edit___ben-je-zeker-dat-je-het-fragment-uit-deze-collectie-wil-verwijderen',
    ),
    TEXT: tText(
      'collection/components/fragment/fragment-edit___ben-je-zeker-dat-je-deze-tekst-blok-wil-verwijderen-uit-deze-collectie',
    ),
    ZOEK: '',
    BOUW: '',
    COLLECTION: tText(
      'collection/components/fragment/fragment-edit___ben-je-zeker-dat-je-de-collectie-uit-deze-bundel-wil-verwijderen',
    ),
    ASSIGNMENT: tText(
      'collection/components/fragment/fragment-edit___ben-je-zeker-dat-je-de-opdracht-uit-deze-bundel-wil-verwijderen',
    ),
  };
}

export function GET_FRAGMENT_EDIT_SWITCH_LABELS(): Record<
  AvoCoreBlockItemType,
  string
> {
  return {
    ITEM: tText(
      'collection/components/fragment/fragment-edit___eigen-beschrijving-bij-fragment',
    ),
    TEXT: tText(
      'collection/components/fragment/fragment-edit___eigen-beschrijving-bij-fragment',
    ),
    ZOEK: '',
    BOUW: '',
    COLLECTION: tText(
      'collection/components/fragment/fragment-edit___eigen-titel-bij-deze-collectie',
    ),
    ASSIGNMENT: tText(
      'collection/components/fragment/fragment-edit___eigen-titel-bij-deze-opdracht',
    ),
  };
}

/**
 * Get the labels for a fragment publish status by type and publish status
 * @constructor
 */
export function GET_FRAGMENT_PUBLISH_STATUS_LABELS(): Record<
  AvoCoreBlockItemType,
  Record<string | 'true' | 'false', string>
> {
  return {
    COLLECTION: {
      true: tText(
        'collection/components/fragment/fragment-edit___deze-collectie-is-publiek',
      ),
      false: tText(
        'collection/components/fragment/fragment-edit___deze-collectie-is-prive',
      ),
    },
    ASSIGNMENT: {
      true: tText(
        'collection/components/fragment/fragment-edit___deze-opdracht-is-publiek',
      ),
      false: tText(
        'collection/components/fragment/fragment-edit___deze-opdracht-is-prive',
      ),
    },
    ZOEK: {
      true: '',
      false: '',
    },
    BOUW: {
      true: '',
      false: '',
    },
    TEXT: {
      true: '',
      false: '',
    },
    ITEM: {
      true: '',
      false: '',
    },
  };
}

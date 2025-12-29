import { AvoCoreContentPickerType } from '@viaa/avo2-types';
import { tText } from '../../../../shared/helpers/translate-text';
import { type PickerTypeOption } from '../../types/content-picker';
import { retrieveAnchors } from './item-providers/anchors';
import {
  retrieveBundles,
  retrieveCollections,
} from './item-providers/collection';
import {
  retrieveContentPages,
  retrieveProjectContentPages,
} from './item-providers/content-page';
import { retrieveInternalLinks } from './item-providers/internal-link';
import { retrieveItems } from './item-providers/item';
import { retrieveProfiles } from './item-providers/profile';

const GET_CONTENT_TYPE_LABELS: () => { [type: string]: string } = () => ({
  CONTENT_PAGE: tText('admin/content/content___content'),
  INTERNAL_LINK: tText('admin/content/content___statisch'),
  COLLECTION: tText('admin/content/content___collecties'),
  ITEM: tText('admin/content/content___items'),
  BUNDLE: tText('admin/content/content___bundels'),
  EXTERNAL_LINK: tText(
    'admin/shared/components/content-picker/content-picker___externe-url',
  ),
  SEARCH_QUERY: tText(
    'admin/shared/components/content-picker/content-picker___zoekfilters',
  ),
  PROJECTS: tText(
    'admin/shared/components/content-picker/content-picker___projecten',
  ),
  PROFILE: tText(
    'admin/shared/components/content-picker/content-picker___gebruiker',
  ),
  ANCHOR_LINK: tText(
    'admin/shared/components/content-picker/content-picker___anchors',
  ),
  FILE: tText(
    'admin/shared/components/content-picker/content-picker___bestand',
  ),
});

export const GET_CONTENT_TYPES: () => PickerTypeOption[] = () => {
  const labels = GET_CONTENT_TYPE_LABELS();
  return [
    {
      value: AvoCoreContentPickerType.CONTENT_PAGE,
      label: labels['CONTENT_PAGE'],
      disabled: false,
      fetch: retrieveContentPages,
      picker: 'SELECT',
    },
    {
      value: AvoCoreContentPickerType.INTERNAL_LINK,
      label: labels['INTERNAL_LINK'],
      disabled: false,
      fetch: retrieveInternalLinks,
      picker: 'SELECT',
    },
    {
      value: AvoCoreContentPickerType.COLLECTION,
      label: labels['COLLECTION'],
      disabled: false,
      fetch: retrieveCollections,
      picker: 'SELECT',
    },
    {
      value: AvoCoreContentPickerType.ITEM,
      label: labels['ITEM'],
      disabled: false,
      fetch: retrieveItems,
      picker: 'SELECT',
    },
    {
      value: AvoCoreContentPickerType.BUNDLE,
      label: labels['BUNDLE'],
      disabled: false,
      fetch: retrieveBundles,
      picker: 'SELECT',
    },
    {
      value: AvoCoreContentPickerType.EXTERNAL_LINK,
      label: labels['EXTERNAL_LINK'],
      disabled: false,
      picker: 'TEXT_INPUT',
      placeholder: 'https://',
    },
    {
      value: AvoCoreContentPickerType.SEARCH_QUERY,
      label: labels['SEARCH_QUERY'],
      disabled: false,
      picker: 'TEXT_INPUT',
      placeholder: tText(
        'admin/shared/components/content-picker/content-picker___plak-hier-uw-zoekpagina-url',
      ),
    },
    {
      value: AvoCoreContentPickerType.PROJECTS,
      label: labels['PROJECTS'],
      disabled: false,
      fetch: retrieveProjectContentPages,
      picker: 'SELECT',
    },
    {
      value: AvoCoreContentPickerType.PROFILE,
      label: labels['PROFILE'],
      disabled: false,
      fetch: (name, limit) => retrieveProfiles(name, limit),
      picker: 'SELECT',
    },
    {
      value: AvoCoreContentPickerType.ANCHOR_LINK,
      label: labels['ANCHOR_LINK'],
      disabled: false,
      fetch: retrieveAnchors,
      picker: 'SELECT',
    },
    {
      value: AvoCoreContentPickerType.FILE,
      label: labels['FILE'],
      disabled: false,
      picker: 'FILE_UPLOAD',
    },
  ];
};

export const DEFAULT_ALLOWED_TYPES: AvoCoreContentPickerType[] = [
  AvoCoreContentPickerType.CONTENT_PAGE,
  AvoCoreContentPickerType.ITEM,
  AvoCoreContentPickerType.COLLECTION,
  AvoCoreContentPickerType.BUNDLE,
  AvoCoreContentPickerType.INTERNAL_LINK,
  AvoCoreContentPickerType.EXTERNAL_LINK,
  AvoCoreContentPickerType.ANCHOR_LINK,
  AvoCoreContentPickerType.FILE,
];

export const REACT_SELECT_DEFAULT_OPTIONS = {
  className: 'c-select',
  classNamePrefix: 'c-select',
};

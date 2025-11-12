import { IconName } from '@viaa/avo2-components'

import { tText } from '../../../shared/helpers/translate-text.js'
import { type ReactSelectOption } from '../../../shared/types/index.js'

export const GET_ADMIN_ICON_OPTIONS: () => ReactSelectOption<IconName>[] =
  () => [
    {
      label: tText('admin/shared/constants/index___afbeelding'),
      value: IconName.image,
    },
    {
      label: tText('admin/shared/constants/index___aktetas'),
      value: IconName.briefcase,
    },
    {
      label: tText('admin/shared/constants/index___audio'),
      value: IconName.headphone,
    },
    {
      label: tText('admin/shared/constants/index___collectie'),
      value: IconName.collection,
    },
    {
      label: tText('admin/shared/constants/index___download'),
      value: IconName.download,
    },
    {
      label: tText('admin/shared/constants/index___externe-link'),
      value: IconName.externalLink,
    },
    {
      label: tText('admin/shared/constants/index___help'),
      value: IconName.helpCircle,
    },
    {
      label: tText('admin/shared/constants/index___info'),
      value: IconName.info,
    },
    {
      label: tText('admin/shared/constants/index___kalender'),
      value: IconName.calendar,
    },
    {
      label: tText('admin/shared/constants/index___klascement'),
      value: IconName.klascement,
    },
    {
      label: tText('admin/shared/constants/index___link'),
      value: IconName.link2,
    },
    {
      label: tText('admin/shared/constants/index___link-delen'),
      value: IconName.share2,
    },
    {
      label: tText('admin/shared/constants/index___login'),
      value: IconName.logIn,
    },
    {
      label: tText('admin/shared/constants/index___opdracht'),
      value: IconName.clipboard,
    },
    {
      label: tText('admin/shared/constants/index___profiel'),
      value: IconName.user,
    },
    {
      label: tText('admin/shared/constants/index___smartschool'),
      value: IconName.smartschool,
    },
    {
      label: tText('admin/shared/constants/index___leerid'),
      value: IconName.leerid,
    },
    {
      label: tText('admin/shared/constants/index___tekstbestand'),
      value: IconName.fileText,
    },
    {
      label: tText('admin/shared/constants/index___uploaden'),
      value: IconName.upload,
    },
    {
      label: tText('admin/shared/constants/index___video'),
      value: IconName.video,
    },
    {
      label: tText('admin/shared/constants/index___view'),
      value: IconName.eye,
    },
    {
      label: tText('admin/shared/constants/index___zoek'),
      value: IconName.search,
    },
  ]

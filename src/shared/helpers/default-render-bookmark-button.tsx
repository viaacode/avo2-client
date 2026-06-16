import {
  IconName,
  ToggleButton,
  type ToggleButtonProps,
} from '@viaa/avo2-components';
import { type ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../components/Tooltip/Tooltip';

export type renderBookmarkButtonProps = Pick<
  ToggleButtonProps,
  'active' | 'onClick' | 'ariaLabel' | 'title' | 'type'
>;

const getBookmarkButton = (props: renderBookmarkButtonProps): ReactNode => {
  return <ToggleButton type="tertiary" icon={IconName.bookmark} {...props} />;
};

export const defaultRenderBookmarkButton = (
  props: renderBookmarkButtonProps,
): ReactNode => {
  if (props.title) {
    return (
      <Tooltip position="top">
        <TooltipTrigger>
          {getBookmarkButton({ ...props, title: '' })}
        </TooltipTrigger>
        <TooltipContent>
          <span>{props.title}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return getBookmarkButton(props);
};

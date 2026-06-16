import { type Placement } from '@floating-ui/react';
import {
  Tooltip as ReactCompTooltip,
  TooltipContent,
  TooltipTrigger,
  useSlot,
} from '@meemoo/react-components';
import { clsx } from 'clsx';
import { CSSProperties, type FC, type ReactNode } from 'react';

import './Tooltip.scss';

export { TooltipContent, TooltipTrigger } from '@meemoo/react-components';

export interface TooltipProps {
  children: ReactNode;
  position?: Placement;
  offset?: number;
  contentClassName?: string;
  style?: CSSProperties;
}

export const Tooltip: FC<TooltipProps> = ({
  children,
  position = 'top',
  offset,
  contentClassName,
  style,
}) => {
  const triggerElement = useSlot(TooltipTrigger, children);
  const contentElement = useSlot(TooltipContent, children);
  return (
    <ReactCompTooltip
      position={position}
      offset={offset}
      contentClassName={clsx('c-react-components-tooltip', contentClassName)}
      arrowFillColor="#edeff2" // $color-gray-400
      arrowStrokeColor="#557891" // $color-gray-50
      arrowStrokeWidth={1}
      style={style}
    >
      <TooltipTrigger>{triggerElement}</TooltipTrigger>
      <TooltipContent>{contentElement}</TooltipContent>
    </ReactCompTooltip>
  );
};

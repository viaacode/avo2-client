import './AssignmentHeading.scss';

import { useWindowScroll } from '@uidotdev/usehooks';
import {
  Container,
  Navbar,
  Toolbar,
  ToolbarItem,
  ToolbarLeft,
  ToolbarRight,
} from '@viaa/avo2-components';
import { clsx } from 'clsx';
import { type FC, type ReactNode, useEffect, useState } from 'react';

import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour';

interface AssignmentHeadingProps {
  actions?: ReactNode;
  back?: ReactNode;
  info?: ReactNode;
  tabs?: ReactNode;
  title: ReactNode;
  tour?: ReactNode | null;
}

export const AssignmentHeading: FC<AssignmentHeadingProps> = ({
  actions,
  back,
  info,
  tabs,
  title,
  tour = <InteractiveTour showButton />,
}) => {
  const [{ y }] = useWindowScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    /**
     * Roughly the height of the "Mijn opdrachten" button + title at `$g-bp4`
     * @unit px
     */
    const breakpoint = 120;
    const depth = y || 0;

    if (depth >= breakpoint && !isScrolled) {
      setIsScrolled(true);
    } else if (depth === 0) {
      // Only update at exact 0 to avoid page-locking repaints & pseudo-states
      setIsScrolled(false);
    }
  }, [y, isScrolled, setIsScrolled]);

  return (
    <>
      <Navbar
        background="alt"
        placement="top"
        autoHeight
        className={clsx({
          'c-assignment-heading': true,
          'c-assignment-heading--scrolled': isScrolled,
        })}
      >
        <Container
          mode="vertical"
          size="small"
          className={clsx({
            'u-p-b-0': info,
          })}
        >
          <Container mode="horizontal">
            <Toolbar autoHeight className="c-assignment-heading__top">
              <ToolbarLeft>
                <ToolbarItem className="c-assignment-heading__title" grow>
                  {back}
                  {title}
                </ToolbarItem>
              </ToolbarLeft>

              {actions && (
                <ToolbarRight>
                  <ToolbarItem>{actions}</ToolbarItem>
                </ToolbarRight>
              )}
            </Toolbar>
          </Container>
        </Container>

        {info && (
          <Container
            background="alt"
            mode="vertical"
            size="small"
            className="u-padding-bottom-s u-p-t-0"
          >
            <Container mode="horizontal">{info}</Container>
          </Container>
        )}

        {(tabs || tour) && (
          <Container mode="horizontal" className="c-assignment-heading__bottom">
            <Toolbar className="c-toolbar--no-height">
              {tabs && <ToolbarLeft>{tabs}</ToolbarLeft>}

              {tour && <ToolbarRight>{tour}</ToolbarRight>}
            </Toolbar>
          </Container>
        )}
      </Navbar>
    </>
  );
};

// eslint-disable-next-line import/no-unresolved
import meemooLogo from '@assets/images/meemoo-logo.png';
// eslint-disable-next-line import/no-unresolved
import vlaamseOverheidLogoSrc from '@assets/images/vlaanderen-logo.svg';
import { Container, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { orderBy } from 'es-toolkit';
import { type FC, useState } from 'react';

import { type BooleanDictionary } from '../../helpers/navigation';
import { tText } from '../../helpers/translate-text';
import { useAllGetNavItems } from '../../hooks/useAllGetNavItems';
import { type AppContentNavElement } from '../../services/navigation-items-service';
import { NavigationBarId } from '../Navigation/Navigation.const';
import { NavigationItem } from '../Navigation/NavigationItem';

import './Footer.scss';

export const Footer: FC = () => {
  const [areDropdownsOpen, setDropdownsOpen] = useState<BooleanDictionary>({});

  const { data: allNavItems } = useAllGetNavItems();

  const footerNavItemsColumn1 =
    allNavItems?.[NavigationBarId.FOOTER_COLUMN_1] || [];
  const footerNavItemsColumn2 =
    allNavItems?.[NavigationBarId.FOOTER_COLUMN_2] || [];
  const footerNavItemsColumn3 =
    allNavItems?.[NavigationBarId.FOOTER_COLUMN_3] || [];

  const mapNavItems = (navItems: AppContentNavElement[]) => {
    return orderBy(navItems, ['position'], [Avo.Search.OrderDirection.ASC]).map(
      (item) => {
        return (
          <NavigationItem
            key={item.id}
            item={{
              label: item.label,
              location: item.content_path || '',
              target: item.link_target || '_blank',
              icon: item.icon_name,
              key: item.id.toString(),
              tooltip: item.tooltip,
            }}
            className="c-nav__item c-nav__item--i"
            showActive={false}
            areDropdownsOpen={areDropdownsOpen}
            setDropdownsOpen={setDropdownsOpen}
            onNavigate={() => window?.scrollTo(0, 0)}
          />
        );
      },
      [Avo.Search.OrderDirection.ASC],
    );
  };

  const columnTitle1 = tText('shared/components/footer/footer___kolom-1');
  const columnTitle2 = tText('shared/components/footer/footer___kolom-2');
  const columnTitle3 = tText('shared/components/footer/footer___kolom-3');
  const showColumnTitles = !!columnTitle1 || !!columnTitle2 || !!columnTitle3;
  return (
    <footer className="c-global-footer">
      <Container mode="horizontal" className="c-global-footer__inner">
        <ul className="c-global-footer__column-1">
          {showColumnTitles && (
            <li className="c-global-footer__column-header">{columnTitle1}</li>
          )}
          {mapNavItems(footerNavItemsColumn1)}
        </ul>
        <ul className="c-global-footer__column-2">
          {showColumnTitles && (
            <li className="c-global-footer__column-header">{columnTitle2}</li>
          )}
          {mapNavItems(footerNavItemsColumn2)}
        </ul>
        <ul className="c-global-footer__column-3">
          {showColumnTitles && (
            <li className="c-global-footer__column-header">{columnTitle3}</li>
          )}
          {mapNavItems(footerNavItemsColumn3)}
        </ul>
        <ul className="c-global-footer__column-4">
          <li>
            <a
              href="https://meemoo.be/nl"
              target="_blank"
              rel="noreferrer"
              title={tText('shared/components/footer/footer___meemoo')}
              className="u-text-decoration-none"
            >
              <span className="c-nav__item-label">
                {tText('shared/components/footer/footer___een-initiatief-van')}
              </span>
              <Spacer margin="left-small">
                <img
                  src={meemooLogo}
                  alt={tText(
                    'shared/components/footer/footer___logo-van-meemoo',
                  )}
                />
              </Spacer>
            </a>
          </li>
          <li>
            <a
              href="https://www.vlaanderen.be/"
              target="_blank"
              rel="noreferrer"
              title={tText(
                'shared/components/footer/footer___vlaamse-overheid',
              )}
              className="u-text-decoration-none"
            >
              <span className="c-nav__item-label">
                {tText('shared/components/footer/footer___gesteund-door')}
              </span>
              <Spacer margin="left-small">
                <img
                  src={vlaamseOverheidLogoSrc}
                  alt={tText(
                    'shared/components/footer/footer___logo-van-vlaamse-overheid',
                  )}
                />
              </Spacer>
            </a>
          </li>
        </ul>
      </Container>
    </footer>
  );
};

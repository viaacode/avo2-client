import { type TabProps } from '@viaa/avo2-components';
import {
  type Dispatch,
  type ReactText,
  type SetStateAction,
  useState,
} from 'react';

type UseTabsTuple = [
  ReactText,
  Dispatch<SetStateAction<ReactText>>,
  TabProps[],
];

export const useTabs = (
  tabs: TabProps[],
  initialTab: ReactText,
): UseTabsTuple => {
  const [currentTab, setCurrentTab] = useState<ReactText>(String(initialTab));

  const tabsWithActiveState = tabs.map((tab: TabProps) => ({
    ...tab,
    active: tab.id === currentTab,
  }));

  return [currentTab, setCurrentTab, tabsWithActiveState];
};

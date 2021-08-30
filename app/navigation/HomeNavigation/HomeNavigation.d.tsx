import { RouteProp, NavigatorScreenParams } from '@react-navigation/native';
import { MaterialBottomTabNavigationProp } from '@react-navigation/material-bottom-tabs';

import type {
  AddCredentialNavigationParamList,
  CredentialNavigationParamList,
  SettingsNavigationParamList,
} from '../';

export type HomeNavigationParamList = {
  CredentialNavigation: NavigatorScreenParams<CredentialNavigationParamList>;
  ShareNavigation: undefined;
  AddCredentialNavigation: NavigatorScreenParams<AddCredentialNavigationParamList>;
  SettingsNavigation: NavigatorScreenParams<SettingsNavigationParamList>;
};

export type CredentialNavigationProps = {
  route: RouteProp<HomeNavigationParamList, 'CredentialNavigation'>;
  navigation: MaterialBottomTabNavigationProp<HomeNavigationParamList, 'CredentialNavigation'>;
}

export type ShareNavigationProps = {
  route: RouteProp<HomeNavigationParamList, 'ShareNavigation'>;
  navigation: MaterialBottomTabNavigationProp<HomeNavigationParamList, 'ShareNavigation'>;
}

export type AddCredentialNavigationProps = {
  route: RouteProp<HomeNavigationParamList, 'AddCredentialNavigation'>;
  navigation: MaterialBottomTabNavigationProp<HomeNavigationParamList, 'AddCredentialNavigation'>;
}

export type SettingsNavigationProps = {
  route: RouteProp<HomeNavigationParamList, 'SettingsNavigation'>;
  navigation: MaterialBottomTabNavigationProp<HomeNavigationParamList, 'SettingsNavigation'>;
}

export type TabIconProps = {
  color: string;
}

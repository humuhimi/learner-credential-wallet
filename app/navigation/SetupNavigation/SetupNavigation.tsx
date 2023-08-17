import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, Image, AccessibilityInfo, ImageStyle, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, CheckBox } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppDispatch, useDynamicStyles } from '../../hooks';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';


import appConfig from '../../../app.json';
import { initialize, pollWalletState, selectWalletState } from '../../store/slices/wallet';
import { LoadingIndicator, SafeScreenView, AccessibleView, PasswordForm } from '../../components';
import walletImage from '../../assets/wallet.png';
import { useAccessibilityFocus } from '../../hooks';

import dynamicStyleSheet from './SetupNavigation.styles';
import type {
  StartStepProps,
  CreateStepProps,
  PasswordStepProps,
  ChapiStepProps,
  ForFadeType,
  SetupNavigationParamList,
} from './SetupNavigation.d';

import { DetailsScreen } from '../../screens';
import { useSelector } from 'react-redux';
import { registerWallet } from '../../lib/registerWallet';

const Stack = createStackNavigator<SetupNavigationParamList>();

const forFade: ForFadeType = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

export default function SetupNavigation(): JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="StartStep" component={StartStep} />
      <Stack.Screen name="PasswordStep" component={PasswordStep} />
      <Stack.Screen name="ChapiStep" component={ChapiStep} />
      <Stack.Screen
        name="CreateStep"
        component={CreateStep}
        options={{ cardStyleInterpolator: forFade }}
      />
      <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
    </Stack.Navigator>
  );
}

function StartStep({ navigation }: StartStepProps) {
  const { styles, mixins } = useDynamicStyles(dynamicStyleSheet);

  return (
    <SafeScreenView style={[styles.container, styles.containerMiddle]}>
      <Image
        style={styles.image as ImageStyle}
        source={walletImage}
        accessible
        accessibilityLabel={`${appConfig.displayName} Logo`}
      />
      <Text
        style={styles.title}
        accessibilityRole="header"
      >
        {appConfig.displayName}
      </Text>
      <Text style={styles.paragraph}>
        A place to store all your credentials. They stay on your device until
        you decide to share them.
      </Text>
      <View style={mixins.buttonGroup}>
        <Button
          buttonStyle={[mixins.button, mixins.buttonPrimary]}
          containerStyle={mixins.buttonContainer}
          titleStyle={mixins.buttonTitle}
          title="Quick Setup"
          onPress={() => navigation.navigate('PasswordStep')}
        />
      </View>
    </SafeScreenView>
  );
}

function PasswordStep({ navigation }: PasswordStepProps) {
  const { theme, mixins, styles } = useDynamicStyles(dynamicStyleSheet);

  const [enableBiometrics, setEnableBiometrics] = useState(false);
  const { isBiometricsSupported } = useSelector(selectWalletState);
  const [password, setPassword] = useState<string>();

  function _goToNextStep() {
    if (password !== undefined) {
      navigation.navigate('ChapiStep', {
        password,
        enableBiometrics,
      });
    }
  }

  function _onPressBiometrics() {
    setEnableBiometrics(!enableBiometrics);
  }

  return (
    <SafeScreenView style={styles.container}>
      <AccessibleView style={styles.stepContainer} label="Step 1 of 3">
        <Text style={[styles.stepText, styles.stepTextActive]}>Step 1</Text>
        <View style={styles.stepDivider} />
        <Text style={styles.stepText}>2</Text>
        <View style={styles.stepDivider} />
        <Text style={styles.stepText}>3</Text>
      </AccessibleView>
      <Text
        style={styles.header}
        accessibilityRole="header"
      >
        Password
      </Text>
      <Text style={styles.paragraphRegular}>
        Setup a password to secure your wallet. You will not be able to recover
        a lost password.
      </Text>
      <View style={styles.body}>
        <PasswordForm onChangePassword={setPassword} style={styles.inputGroup} focusOnMount />
        {isBiometricsSupported && (
          <>
            <View style={styles.inputSeparator} />
            <TouchableWithoutFeedback onPress={_onPressBiometrics}>
              <View style={styles.biometricsButton}>
                <CheckBox
                  checked={enableBiometrics}
                  checkedColor={theme.color.buttonPrimary}
                  containerStyle={[mixins.checkboxContainer, styles.checkboxContainer]}
                />
                <Text style={styles.biometricsButtonText}>Use biometrics to unlock</Text>
              </View>
            </TouchableWithoutFeedback>
          </>
        )}
      </View>
      <View style={mixins.buttonGroup}>
        <Button
          buttonStyle={[mixins.button, styles.buttonClear]}
          containerStyle={styles.buttonClearContainer}
          titleStyle={[mixins.buttonTitle, styles.buttonClearTitle]}
          title="Cancel"
          onPress={() => navigation.navigate('StartStep')}
        />
        <View style={mixins.buttonSeparator} />
        <Button
          buttonStyle={[mixins.button, mixins.buttonPrimary]}
          containerStyle={mixins.buttonContainer}
          titleStyle={mixins.buttonTitle}
          title="Next"
          onPress={_goToNextStep}
          disabled={!password}
          disabledStyle={mixins.buttonDisabled}
          disabledTitleStyle={mixins.buttonTitle}
          iconRight
          icon={
            <MaterialIcons
              style={styles.arrowIcon}
              name="arrow-forward"
              color={theme.color.backgroundSecondary}
              size={theme.iconSize}
            />
          }
        />
      </View>
    </SafeScreenView>
  );
}

function ChapiStep({ navigation, route }: ChapiStepProps) {
  const { theme, mixins, styles } = useDynamicStyles(dynamicStyleSheet);

  function _goToNextStep() {
    navigation.navigate('CreateStep', route.params);
  }

  return (
    <SafeScreenView style={styles.container}>
      <AccessibleView style={styles.stepContainer} label="Step 2 of 3">
        <Text style={styles.stepText}>1</Text>
        <View style={styles.stepDivider} />
        <Text style={[styles.stepText, styles.stepTextActive]}>Step 2</Text>
        <View style={styles.stepDivider} />
        <Text style={styles.stepText}>3</Text>
      </AccessibleView>
      <Text
        style={styles.header}
        accessibilityRole="header"
      >
        Register Wallet
      </Text>
      <Text style={styles.paragraphRegular}>
        Register your wallet for easy credential adding in the future.
      </Text>

      <View style={[styles.body, styles.buttonGroupCenterContainer]}>
        <Button 
          buttonStyle={[mixins.button, mixins.buttonPrimary]}
          title = "Go to Register Wallet"
          onPress={registerWallet}
        />
      </View>

      <View style={mixins.buttonGroup}>
        <Button
          buttonStyle={[mixins.button, styles.buttonClear]}
          containerStyle={styles.buttonClearContainer}
          titleStyle={[mixins.buttonTitle, styles.buttonClearTitle]}
          title="Cancel"
          onPress={() => navigation.navigate('StartStep')}
        />
        <View style={mixins.buttonSeparator} />
        <Button
          buttonStyle={[mixins.button, mixins.buttonPrimary]}
          containerStyle={mixins.buttonContainer}
          titleStyle={mixins.buttonTitle}
          title="Next/Skip"
          onPress={_goToNextStep}
          disabledStyle={mixins.buttonDisabled}
          disabledTitleStyle={mixins.buttonTitle}
          iconRight
          icon={
            <MaterialIcons
              style={styles.arrowIcon}
              name="arrow-forward"
              color={theme.color.backgroundSecondary}
              size={theme.iconSize}
            />
          }
        />
      </View>
    </SafeScreenView>
  );
}

function CreateStep({ route }: CreateStepProps) {
  const { styles, mixins } = useDynamicStyles(dynamicStyleSheet);

  const { password, enableBiometrics } = route.params;
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [titleRef, focusTitle] = useAccessibilityFocus<Text>();

  async function _initializeWallet() {
    await dispatch(initialize({ passphrase: password, enableBiometrics }));
    await dispatch(pollWalletState());
  }

  useEffect(() => {
    focusTitle();
    const t = setTimeout(() => {
      setLoading(false);
      AccessibilityInfo.announceForAccessibility('Finished creating wallet');
    }, 2000);

    return () => clearTimeout(t);
  }, []);

  return (
    <SafeScreenView style={styles.container}>
      <AccessibleView style={styles.stepContainer} label="Step 3 of 3">
        <Text style={styles.stepText}>1</Text>
        <View style={styles.stepDivider} />
        <Text style={styles.stepText}>2</Text>
        <View style={styles.stepDivider} />
        <Text style={[styles.stepText, styles.stepTextActive]}>Step 3</Text>
      </AccessibleView>
      <Text style={styles.header} ref={titleRef} accessibilityRole="header">
        Creating Wallet
      </Text>
      <Text style={styles.paragraphRegular}>This will only take a moment.</Text>
      <View style={styles.loadingContainer}>
        <LoadingIndicator loading={loading} />
      </View>
      <View style={mixins.buttonGroup}>
        <Button
          buttonStyle={[mixins.button, mixins.buttonPrimary]}
          containerStyle={mixins.buttonContainer}
          titleStyle={mixins.buttonTitle}
          title="Take Me To My Wallet"
          onPress={_initializeWallet}
          disabled={loading}
          disabledStyle={mixins.buttonDisabled}
          disabledTitleStyle={mixins.buttonTitle}
        />
      </View>
    </SafeScreenView>
  );
}

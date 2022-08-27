import React, { ForwardedRef, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Text } from 'react-native';
import { Button } from 'react-native-elements';
import { mixins } from '../../styles';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import LoadingIndicatorDots from '../LoadingIndicatorDots/LoadingIndicatorDots';
import PasswordInput from '../PasswordInput/PasswordInput';

import styles from './ImportFileModal.styles';
import { ImportFileModalProps, ImportFileModalHandle, SubmitPasswordCallback } from './ImportFileModal.d';
import { pickAndReadFile, ReportDetails } from '../../lib/import';
import { HumanReadableError } from '../../lib/error';
import { decryptData, isLocked } from '../../lib/encrypt';

enum RestoreModalState {
  Loading,
  Password,
  Details,
  Error,
  Hidden,
}

function ImportFileModal({
  onPressDetails,
  importItem,
  onFinished,
  textConfig,
}: ImportFileModalProps, ref: ForwardedRef<ImportFileModalHandle>): JSX.Element | null {
  const [password, setPassword] = useState('');
  const [modalState, setModalState] = useState(RestoreModalState.Hidden);  
  const [reportDetails, setReportDetails] = useState<ReportDetails>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const onSubmitPassword = useRef<SubmitPasswordCallback>();
  const reportSummary = reportDetails ? Object.keys(reportDetails).join('\n') : '';

  useImperativeHandle(ref, () => ({
    doImport,
  }));
  
  async function doImport() {
    try {
      let data = await pickAndReadFile();

      if (isLocked(data)) {
        const passphrase = await _requestPassword();
        data = decryptData(data, passphrase);
      }

      const reportDetails = await importItem(data);

      setReportDetails(reportDetails);
      setModalState(RestoreModalState.Details);
    } catch (err) {
      if (err instanceof HumanReadableError) {
        setErrorMessage(err.message);
      } else {
        console.error(err);
        setErrorMessage('Something went wrong');
      }

      setModalState(RestoreModalState.Error);
    }
  }

  function _onSubmitPassword() {
    onSubmitPassword.current?.(password);
    setPassword('');
  }

  function _onPressDetails() {
    setModalState(RestoreModalState.Hidden);

    if (reportDetails === undefined) {
      throw new Error('No import report details');
    }
    
    onPressDetails(reportDetails);
  }
  

  function _requestPassword() {
    return new Promise<string>((resolve) => {
      onSubmitPassword.current = (password) => {
        setModalState(RestoreModalState.Loading);
        resolve(password);
      };
      setModalState(RestoreModalState.Password);
    });
  }

  function _onRequestClose() {
    setModalState(RestoreModalState.Hidden);
  }

  switch (modalState) {
  case RestoreModalState.Loading:
    return (
      <ConfirmModal 
        title={textConfig.loadingTitle}
        confirmButton={false}
        cancelButton={false}
      >
        <>
          <Text style={mixins.modalBodyText}>
            This will only take a moment.
          </Text>
          <LoadingIndicatorDots />
        </>
      </ConfirmModal>
    );
  case RestoreModalState.Password:
    return (
      <ConfirmModal
        onConfirm={_onSubmitPassword}
        title={textConfig.lockedTitle}
        cancelButton={false}
        confirmText="Submit"
      >
        <Text style={mixins.modalBodyText}>
          {textConfig.lockedBody}
        </Text>
        <PasswordInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.password}
        />
      </ConfirmModal>
    );
  case RestoreModalState.Details:
    return (
      <ConfirmModal
        title={textConfig.finishedTitle}
        cancelButton={false}
        confirmText={textConfig.finishedButton}
        onConfirm={onFinished}
        onRequestClose={_onRequestClose}
        cancelOnBackgroundPress
      >
        <Text style={mixins.modalBodyText}>{reportSummary}</Text>
        <Button
          buttonStyle={mixins.buttonClear}
          titleStyle={[mixins.buttonClearTitle, styles.underline]}
          containerStyle={mixins.buttonClearContainer}
          title="Details"
          onPress={_onPressDetails}
        />
      </ConfirmModal>
    );
  case RestoreModalState.Error:
    return (
      <ConfirmModal
        title={errorMessage}
        cancelButton={false}
        confirmText="Close"
        onRequestClose={_onRequestClose}
        cancelOnBackgroundPress
      >
        <Text style={mixins.modalBodyText}>{textConfig.errorBody}</Text>
      </ConfirmModal>
    );
  case RestoreModalState.Hidden: return null;
  default: return null;
  }
}

export default forwardRef(ImportFileModal);
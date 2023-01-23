import PageWrapper from '../components/PageWrapper';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {Text, StyleSheet} from 'react-native';
import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
const MobileVerification = ({language, theme, route, text}) => {
  const navigation = useNavigation();
  const rowStyle =
    language === 'english'
      ? {flexDirection: 'row'}
      : {flexDirection: 'row-reverse'};
  const {mobileNumber} = route.params;
  const [value, setValue] = useState('');
  const [nextButtonDisabled, setNextButtonDisabled] = useState(true);
  useEffect(() => {
    if (value.length === 5) setNextButtonDisabled(false);
    else setNextButtonDisabled(true);
  });
  const navigateToSetPasswrod = () => {
    if (!nextButtonDisabled) navigation.navigate('SetPassword');
  };
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const ref = useBlurOnFulfill({value, cellCount: 5});
  return (
    <PageWrapper
      language={language}
      theme={theme}
      title={text['verification-title']}
      subtitle={`${text['verification-subtitle']} ${mobileNumber}`}
      buttonText={text['verification-button']}
      onButtonClick={navigateToSetPasswrod}
      buttonDisabled={nextButtonDisabled}>
      <CodeField
        ref={ref}
        {...props}
        cellCount={5}
        value={value}
        onChangeText={setValue}
        rootStyle={[rowStyle, styles.codeFieldRoot]}
        onSubmitEditing={navigateToSetPasswrod}
        renderCell={({index, symbol, isFocused}) => (
          <Text
            key={index}
            style={[
              styles.cell,
              theme === 'dark' ? {color: '#FFFFFF'} : {color: '#1C2437'},
              isFocused && styles.focusCell,
            ]}
            onLayout={getCellOnLayoutHandler(index)}>
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        )}
      />
      <Text style={{color: '#B7B7B7', marginTop: 10}}>
        {text['verification-not-recieved']}
      </Text>
      <Text
        style={[
          {fontSize: 16},
          theme === 'dark' ? {color: '#FFFFFF'} : {color: '#1C2437'},
        ]}>
        {text['verification-request']}
      </Text>
    </PageWrapper>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, padding: 20},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {marginTop: 20},
  cell: {
    fontFamily: 'roboto',
    fontWeight: 'bold',
    width: 45,
    height: 65,
    fontSize: 24,
    lineHeight: 55,
    borderWidth: 3,
    borderRadius: 10,
    textAlign: 'center',
  },
  focusCell: {
    borderColor: '#007236',
  },
});
export default MobileVerification;
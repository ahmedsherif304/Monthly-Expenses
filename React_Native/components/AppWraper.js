import {useEffect, useState} from 'react';
import AddItem from './AddItem';
import {TextInput, Text, View, FlatList, StyleSheet, Alert} from 'react-native';
import CustomButton from './CustomButton';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {updateExpenses, updateTotalSpent} from '../redux/months';
import textsFile from '../assets/texts.json';
const AppWraper = ({route}) => {
  const dispatch = useDispatch();
  const monthID = route.params.id;
  const language = useSelector(state => state.language.language);
  const texts = language === 'english' ? textsFile.english : textsFile.arabic;
  const month = useSelector(state => state.months.months).filter(month => {
    return month.id === monthID;
  })[0];
  const expenses = month.expenses || [];
  const totalSpent = month.totalSpent || 0;
  const navigation = useNavigation();

  useEffect(() => {
    const dummyValues = expenses.map(v => {
      return {id: v.id, value: 0};
    });
    setValues(dummyValues);
    calculateTotalSpent(expenses);
    navigation.setOptions({
      title: `${texts['month-title']}: ${month.month}/${month.year}`,
      headerTintColor: '#ffffff',
      headerStyle: {
        backgroundColor: '#045858',
        justifyContent: 'center',
        alignItems: 'center',
      },
    });
  }, []);

  const [values, setValues] = useState([]);
  const handleValueChange = (newValue, id) => {
    const updatedValues = values.map(value => {
      if (value.id === id) {
        return {
          ...value,
          value: newValue,
        };
      }
      return value;
    });
    setValues(updatedValues);
  };

  const updateMoney = (id, type) => {
    let value = parseFloat(values.find(v => v.id === id).value) || 0;
    value = type === 'spend' ? value : -value;
    const updatedExpenses = expenses.map(e => {
      if (e.id === id) {
        return {
          ...e,
          totalPrice: Math.max(e.totalPrice + value, 0),
        };
      }
      return e;
    });
    dispatch(updateExpenses({id: monthID, expenses: updatedExpenses}));
    calculateTotalSpent(updatedExpenses);
    handleValueChange(0, id);
  };
  const calculateTotalSpent = ex => {
    dispatch(
      updateTotalSpent({
        id: monthID,
        totalSpent: ex.reduce((accumulator, expense) => {
          return accumulator + parseFloat(expense.totalPrice);
        }, 0),
      }),
    );
  };

  const [alertVisable, setAlertVisable] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expensePrice, setExpensePrice] = useState(0);
  const handleCancle = () => {
    setExpenseTitle('');
    setExpensePrice(0);
    setAlertVisable(false);
  };
  const handleAdd = () => {
    if (expenseTitle === '') {
      handleCancle();
      return;
    } else if (
      expenses.filter(expense => {
        return expense.title === expenseTitle;
      })[0]
    ) {
      Alert.alert(texts['dublicate-item'], '', [
        {text: texts['ok'], onPress: handleCancle},
      ]);
      return;
    }
    const maxID = Math.max(
      ...expenses.map(expense => {
        return expense.id;
      }),
      0,
    );
    const defalutValue = expensePrice >= 0 ? expensePrice : 0;
    const updatedExpenses = [
      ...expenses,
      {
        id: maxID + 1,
        title: expenseTitle,
        totalPrice: parseFloat(defalutValue),
      },
    ];
    const updatedValues = [...values, {id: maxID + 1, value: 0}];
    dispatch(updateExpenses({id: monthID, expenses: updatedExpenses}));
    setValues(updatedValues);
    calculateTotalSpent(updatedExpenses);
    handleCancle();
  };
  const onRemovePress = id => {
    Alert.alert(texts['remove-item-alert'], '', [
      {text: texts['yes'], onPress: handleRemove.bind(this, id)},
      {text: texts['no']},
    ]);
  };
  const handleRemove = id => {
    const updatedExpenses = expenses.filter(expense => {
      return expense.id !== id;
    });
    const updatedValues = values.filter(value => {
      return value.id !== id;
    });
    dispatch(updateExpenses({id: monthID, expenses: updatedExpenses}));
    setValues(updatedValues);
    calculateTotalSpent(updatedExpenses);
  };

  return (
    <View style={{backgroundColor: '#ecdca7ab', flex: 1, paddingBottom: 10}}>
      <Text
        style={{
          fontSize: 30,
          margin: 'auto',
          textAlign: 'center',
          color: 'black',
        }}>
        {texts['list-of-expenses']}
      </Text>
      <FlatList
        keyboardShouldPersistTaps="always"
        style={{marginBottom: 'auto'}}
        data={expenses}
        renderItem={({item}) => (
          <View
            style={{
              alignItems: 'center',
              padding: 10,
            }}>
            <Text style={{fontSize: 20, color: '#3C2A21', fontWeight: 'bold'}}>
              {item.title}
            </Text>
            <Text style={{fontSize: 20, color: '#211b44', fontWeight: 'bold'}}>
              {item.totalPrice}
            </Text>
            <TextInput
              value={values?.find(v => v.id === item.id)?.value || null}
              onChangeText={value => handleValueChange(value, item.id)}
              placeholder={texts['money-place-holder']}
              style={styles.newExpenseInput}
              keyboardType="numeric"
              maxLength={5}
              onSubmitEditing={updateMoney.bind(this, item.id, 'spend')}
            />
            <View
              style={{
                flex: 1,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <CustomButton
                buttonStyle={styles.customButton}
                textStyle={styles.customButtonText}
                title={texts['spend-money']}
                onPress={updateMoney.bind(this, item.id, 'spend')}
              />
              <CustomButton
                buttonStyle={styles.customButton}
                textStyle={styles.customButtonText}
                title={texts['save-money']}
                onPress={updateMoney.bind(this, item.id, 'save')}
              />
              <CustomButton
                buttonStyle={styles.customButton}
                textStyle={styles.customButtonText}
                title={texts['remove-item']}
                onPress={onRemovePress.bind(this, item.id)}
              />
            </View>
            <View
              style={{
                marginTop: 5,
                borderBottomColor: 'black',
                borderBottomWidth: StyleSheet.hairlineWidth,
                alignSelf: 'stretch',
              }}
            />
          </View>
        )}></FlatList>
      <View
        style={{
          borderBottomColor: 'black',
          borderBottomWidth: 5,
          alignSelf: 'stretch',
        }}
      />
      <Text
        style={{
          fontSize: 25,
          alignSelf: 'center',
          padding: 10,
          color: '#350c0c',
          fontWeight: 'bold',
        }}>
        {`${texts['total-spent']} : ${totalSpent}`}
      </Text>
      <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
        <CustomButton
          buttonStyle={styles.customButton}
          textStyle={styles.customButtonText}
          title={texts['add-expense']}
          onPress={setAlertVisable.bind(this, true)}
        />
        <CustomButton
          buttonStyle={styles.customButton}
          textStyle={styles.customButtonText}
          title={texts['months-page']}
          onPress={() => navigation.navigate('months')}
        />
      </View>
      <AddItem
        alertVisable={alertVisable}
        expenseTitle={expenseTitle}
        setExpenseTitle={setExpenseTitle}
        expensePrice={expensePrice}
        setExpensePrice={setExpensePrice}
        handleAdd={handleAdd}
        handleCancle={handleCancle}
        newExpenseInputStyle={styles.newExpenseInput}
        customButtonStyle={styles.customButton}
        customButtonTextStyle={styles.customButtonText}
        setAlertVisable={setAlertVisable}
        texts={texts}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  newExpenseInput: {
    borderWidth: 2,
    borderColor: 'gray',
    margin: 5,
    width: 200,
    textAlign: 'center',
  },
  customButton: {
    backgroundColor: '#43435f',
    padding: 10,
    borderRadius: 7,
  },
  customButtonText: {
    fontWeight: 'bold',
    color: 'white',
  },
});
export default AppWraper;
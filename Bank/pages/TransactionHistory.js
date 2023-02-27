import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {View, Text, FlatList, Alert, RefreshControl} from 'react-native';
import {useSelector} from 'react-redux';
import {getTransactionHistory} from '../axios/History';
import texts from '../assets/language.json';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BeneficiariesItem from '../components/BeneficiarieItem';
import {getBeneficiary, deleteBeneficiary} from '../axios/Beneficiaries';
import BeneficiaryModal from '../components/BeneficiaryModal';
const TransactionHistory = ({route}) => {
  const id = route.params;
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const language = useSelector(state => state.language.language);
  const theme = useSelector(state => state.theme.theme);
  const text = texts[language];
  const fontColor = theme === 'light' ? {color: '#1C2437'} : {color: '#F7F7F7'};
  const backgroundColor = theme === 'light' ? '#E5E5E5' : '#1c2125';
  const rowStyle =
    language === 'english' ? {flexDirection: 'row'} : {flexDirection: 'row-reverse'};
  const [history, setHistory] = useState([
    {date: undefined, amount: undefined, details: undefined},
  ]);
  const [beneficiary, setBeneficiary] = useState([
    {key: {imageUrl: undefined, fName: undefined}},
  ]);
  const [beneficiaryModalVisability, setBeneficiaryModalVisability] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const toggleModalVisible = () => {
    setBeneficiaryModalVisability(visibility => {
      return !visibility;
    });
  };
  const getHistory = async () => {
    setRefreshing(true);
    setHistory((await getTransactionHistory(user.id, id)).reverse());
    setBeneficiary(await getBeneficiary(id, user.id));
    setRefreshing(false);
  };
  const navigateToTransfer = () => {
    setBeneficiaryModalVisability(false);
    navigation.navigate(`Transfer`, {id: id, ...beneficiary});
  };
  const deleteData = async () => {
    await deleteBeneficiary(id, user.id);
  };
  const deleteBeneficiaryConfirmation = () => {
    Alert.alert(`${text['sure-delete']} ${beneficiary.fName}`, '', [
      {text: text['ok'], onPress: deleteData},
      {text: text['cancle'], onPress: ''},
    ]);
  };
  useEffect(() => {
    navigation.setOptions({headerShown: false});
    getHistory();
  }, []);
  return (
    <View style={{flex: 1, backgroundColor: backgroundColor}}>
      <Header type={2} pageTitle={'beneficiaries'} />
      <View style={{flex: 1, padding: 20}}>
        <BeneficiariesItem
          type={2}
          item={beneficiary}
          id={id}
          onPress={setBeneficiaryModalVisability.bind(this, true)}
        />
        <View style={{flex: 7}}>
          <Text style={[fontColor, {fontSize: 25, marginBottom: 15}]}>
            {text['transaction-history']}
          </Text>
          <FlatList
            data={history}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={getHistory} />
            }
            renderItem={({item, index}) => {
              return (
                <View key={index}>
                  <View
                    style={[
                      {justifyContent: 'space-between', alignItems: 'center', flex: 1},
                      rowStyle,
                    ]}>
                    <View>
                      <Text style={[{fontSize: 20, marginBottom: 5}, fontColor]}>
                        {item.details}
                      </Text>
                      <Text style={fontColor}>{item.date}</Text>
                    </View>
                    <Text style={fontColor}>${item.amount}</Text>
                  </View>
                  <View
                    style={{
                      marginTop: 20,
                      borderBottomColor: '#000',
                      borderBottomWidth: 2,
                    }}
                  />
                </View>
              );
            }}
          />
        </View>
      </View>
      <Footer page={'beneficiaries'} />
      <BeneficiaryModal
        modalVisibility={beneficiaryModalVisability}
        toggleModalVisible={toggleModalVisible}
        beneficiary={beneficiary}
        id={id}
        transferPressed={navigateToTransfer}
        deletePressed={deleteBeneficiaryConfirmation}
      />
    </View>
  );
};
export default TransactionHistory;

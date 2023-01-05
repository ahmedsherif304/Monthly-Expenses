import {store} from './redux/store';
import {Provider} from 'react-redux';
import ExpensesList from './components/ExpensesList';
import Months from './pages/Months';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const App = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="months" component={Months} />
          <Stack.Screen name="monthDetails" component={ExpensesList} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};
export default App;

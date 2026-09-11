import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import {View,Text} from 'react-native';
import Settings from './Settings';
import {LinearGradient} from 'expo-linear-gradient';
import Profile from './Profile';
import ChatBox from './ChatScreen'

import * as Progress from 'react-native-progress';
import Subscribe from './Subscribe'
import UserProfile from './UserProfile'
import Feather from '@expo/vector-icons/Feather';
import Chat from './Chat';


const Tab = createBottomTabNavigator();


export default function Hub({navigation}) {


  return (

<Tab.Navigator screenOptions={({ route }) => ({
  headerTransparent: true,
  headerShown: false,
  tabBarIcon: ({ focused, color, size }) => {
    let iconName;
    switch (route.name) {

      case 'Chat' :
        iconName = 'message-circle'

        break;
      
      case 'Profile':
        iconName = 'user';
        break;
      case 'Settings':
        iconName = 'settings';
        break;
    }
    return <Feather name={iconName} size={size} color={color} />;
  },
})}

>
  <Tab.Screen name= "Chat" component={Chat}  />

  <Tab.Screen name= "Profile" component={Profile}  />
 
  <Tab.Screen name= "Settings" component={Settings} />

  </Tab.Navigator>

  )



}

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from './Navigation/Screens/HomeScreen';
import ProgressBar from './Navigation/Screens/Progess';
import Hub from './Navigation/Screens/Hub';
import {ThemeContext} from './Navigation/Screens/Settings'
import { useContext, useState } from 'react';




const Stack = createNativeStackNavigator();

export default function App() {


  return (

    
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerTransparent: true, headerShown:false
    
         // icon and back button color
      }} initialRouteName='Home'>
         
        <Stack.Screen name="Home"  component={HomeScreen}/>
        
        <Stack.Screen name='Progress' component={ProgressBar}/>
        <Stack.Screen name='Hub' component={Hub}/>
       
      </Stack.Navigator>
      </NavigationContainer>
   
    
      
  );
}


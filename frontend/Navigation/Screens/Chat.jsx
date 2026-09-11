import axios from 'axios';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';

export default function (Chat){

  const [mayaResponse, SetMayaResponse] = useState('');
  const [UserInput, SetUserInput] = useState('')

   const getMayaResponse = async () => {
  try {


  const response = await axios.get('http://192.168.29.231:8000/maya')
  SetMayaResponse (response.data.reply);


}   catch (error) {
    console.error('Error fetching Maya response:', error)
  }

    };

  useEffect( () => {getMayaResponse();

    }, [])


  

return (
  <TouchableWithoutFeedback onPress = {Keyboard.dismiss}>
  <View style = {{justifyContent:'center', alignItems: 'center', flex:1}}>
    <Text>{mayaResponse}</Text>
    <View style ={{marginTop: 200}}> 
    <TextInput placeholder= 'Type your message here' value={UserInput} onChangeText={SetUserInput} placeholderTextColor = "black" />
    </View>
  </View>
  </TouchableWithoutFeedback>






)

}
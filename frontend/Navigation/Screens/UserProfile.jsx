import * as ImagePicker from 'expo-image-picker'
import {View,Text,TextInput, Image, Keyboard, TouchableOpacity,TouchableWithoutFeedback, Modal, Button, KeyboardAvoidingView, ScrollView} from 'react-native'
import {useState} from 'react'
import Feather from 'react-native-vector-icons/Feather'
import {LinearGradient} from 'expo-linear-gradient'
import axios from 'axios';

  export default function UserProfile ()  {

    const [ProfilePic,setProfilePic] =useState(false)
    const [about,setabout]=useState('')


    const uploadProfilePic = async () => {

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
if (status !== 'granted') {
  alert('Permission to access media library is required!');
  return;
}
      const result= await ImagePicker.launchImageLibraryAsync({
      
        
      
        mediaTypes: ['images', 'videos'],
        quality: 1,
        allowsEditing:true
      
      
      })
      if (result.canceled)  {
      
        setProfilePic(false)
      
      }
      
        if (!result.canceled) {
          const uri = result.assets[0].uri;
          const fileName = uri.split('/').pop();
          const type = result.assets[0].type || 'image/jpeg';
        const formData = new FormData();
        formData.append('file', {
          uri,
          name: fileName,
          type,
        });
        setProfilePic(uri)
        
      
      }
      }



    return (
     
    <View style ={{flex:1,backgroundColor:'black'}}>
   
       <LinearGradient style={{flex:1}} colors= {['#0f0c29', '#302b63', '#24243e']} >
    <KeyboardAvoidingView style={{flex:1}} behaviour='padding' keyboardVerticalOffset={80} >
      
      <ScrollView contentContainerStyle={{flexGrow:1}} keyboardShouldPersistTaps='handled' >
   
   
    <TouchableOpacity style ={{marginBottom:10, backgroundColor:'white', borderRadius: 100, height: 150, width:150, position:'absolute', top: 150, left: 140}} onPress = {uploadProfilePic}>

    {ProfilePic ? (
    <Image
      source={{ uri: ProfilePic }}
      style={{ width: '100%', height: '100%', borderRadius: 999 }}
      resizeMode="cover"
    />
    ):(

   <>
    <Feather style= {{position:'relative', top:65, left: 60}} name='camera' color="black" size={40} /> 
    <Button title="" onPress = {uploadProfilePic} />
    </>
    )}
    </TouchableOpacity>
   
   

   

   

    <View style={{ top:300,left:150}}>
    <View style={{flexDirection:'row', alignItems: 'center'}}>
    <Text style ={{fontWeight:'bold',color:'white', fontSize: 30, marginLeft:-100}}> Age </Text>

    <View style ={{backgroundColor:'white', borderRadius:25,height:20,width:50}}>
      <TextInput/>

    </View>
    </View>
    <View style= {{ marginLeft: -250, marginTop:70, alignItems:'center'}}>
    <Text style ={{fontWeight:'bold', color:'white', fontSize: 30, marginLeft:-40}}> About </Text>
    
    <TextInput style ={{flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: 'white',
    maxHeight: 50, TextAlignVertical:'top'}} value={about} onChangeText={setabout} placeholder = "Make you profile stand out!" placeholderTextColor='white'
     multiline    />
    </View >
    <TouchableOpacity style={{backgroundColor:'white',borderRadius:25,marginTop:200,marginLeft:-90, left:10, height:50,width:300}}>
    <Text style ={{fontWeight:'bold', color:'purple', fontSize: 30, borderRadius:30, textAlign:'center',lineHeight:50}}> Save Changes </Text>
    </TouchableOpacity>
    </View>
    
    </ScrollView>
    
    </KeyboardAvoidingView>
    </LinearGradient>
   
    </View>
  
   

    )

  }


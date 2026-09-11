import { StyleSheet, Text,TextInput, TouchableOpacity, View, Image, ImageBackground, Button, ActivityIndicator, Alert, Switch, ScrollView, KeyboardAvoidingView} from 'react-native';
import {useState, useEffect,useRef} from "react";
import axios from 'axios';
import {FontAwesome} from '@expo/vector-icons';
// import {launchImageLibrary} from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';
import {Modal} from 'react-native';
import moment from 'moment';
import {LinearGradient} from'expo-linear-gradient';
import {FlatList, SafeAreaView} from 'react-native';
import {BlurView} from 'expo-blur' ;
import {useRoute} from '@react-navigation/native'

export default function ChatBox({route}){
  const [AIResponse,setAIResponse] = useState("");
  const [UserInput,setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef();
  const {character_id}=route.params

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const handlesend = async () => {
    if (!UserInput.trim()) {
      console.log("User input is empty");
      return;
      
    }
    const now = new Date().toISOString();
    setMessages(prev => [...prev, { sender: 'user', text: UserInput, timestamp: now }])
    setUserInput('')
    setIsSending(true)
  
      
     
    try{
      const response = await axios.post('http://192.168.0.95:8000/chat/',{message:UserInput});
  console.log(response.data);
  
  
  

  setAIResponse(response.data.reply);
  if (response.data.reply.type ==='image'){
    setMessages(prev => [...prev, { sender: 'ai', image: response.data.reply.data,timestamp:new Date().toISOString() }])
  } else {
    setMessages(prev => [...prev, { sender: 'ai', text: response.data.reply,timestamp:new Date().toISOString()}])
  }
  
  const extraMessages = Math.floor(Math.random() * 3) + 1; 
    // 50% chance the AI will send follow-up messages

      // Sends between 1 to 3 extra messages

      for (let i = 0; i < extraMessages; i++) {
        const randomChance = Math.random();
        if (randomChance < 0.2) {



        await sleep(1200);
     


        
        const followUpResponse = await axios.post('http://192.168.0.95:8000/chat/', { message: "__continue__" });
        setMessages(prev => [...prev, { sender: 'ai', text: followUpResponse.data.reply,timestamp:new Date().toISOString()}]);
        
      }
    }

  
    }finally {
      setIsSending(false) 
    }
  }

  const uploadImage = async () => {
    if (isSending) return; // Prevent multiple uploads at once
    setIsSending(true);
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'Images',
    quality: 1,
  });

  if (result.canceled) {
    setIsSending(false);
    return;
  }
  if (!result.canceled && result.assets && result.assets.length > 0) {
    const uri = result.assets[0].uri;
    const fileName = uri.split('/').pop();
    const type = result.assets[0].type || 'image/jpeg';
    setMessages(prev => [...prev, { sender: 'user', image: uri, timestamp: new Date().toISOString()}]);
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: fileName,
    type,
  });
  
  try {
    const response = await axios.post('http://192.168.0.95:8000/analyze-image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data?.userImage) {
      setMessages(prev => [
        ...prev,
        
        { sender: 'ai', text: response.data.reply, timestamp: new Date().toISOString() },
      ]);
    } 
    
    else {setMessages(prev => [
      ...prev,

      { sender: 'ai', text:response.data.reply, timestamp: new Date().toISOString() },
    ]);
  }}catch (error) {
    console.error("Image upload failed:", error);
    Alert.alert("Upload failed", "Could not send image to server.");
} finally {
  setIsSending(false)
}

}
  };

  const handleClearChat = async () => {
    try {
      const response = await axios.delete("http://192.168.0.95:8000/delete-messages/?confirm=true", {params:{character_id:character_id}});
      if (response.status === 200) {
        setMessages([]); // clear messages from UI
        Alert.alert("Chat cleared successfully");
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
      Alert.alert("Failed to clear chat");
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await axios.get('http://192.168.0.95:8000/get-messages/', { params: {character_id:character_id}});
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, []);


return (
  <KeyboardAvoidingView style={{flex:1}} behavior='padding' keyboardVerticalOffset={0}>
    <LinearGradient style={{flex:1}} colors={['#0f0c29', '#302b63', '#24243e']} > 
  <View style={{ flex:1, justifyContent:'space-between', padding: 10 }}>
 
  <TouchableOpacity onPress={handleClearChat} style={{ backgroundColor: 'red', padding: 10, borderRadius: 8, marginBottom: 10 }}>
      <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Clear Chat</Text>
    </TouchableOpacity>
  
  <ScrollView style={{ flex: 1, marginBottom: 10 }} ref={scrollViewRef} onContentSizeChange={() => scrollViewRef.current.scrollToEnd({animated:'true'})}
   >
        {messages.map((msg, index) => {

const showDateHeader = index === 0 ||
moment(msg.timestamp).format('YYYY-MM-DD') !== moment(messages[index - 1]?.timestamp).format('YYYY-MM-DD');

return(
          <View
            key={index}>
            {showDateHeader && (
              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <Text style={{ fontWeight: 'bold', color: 'white' }}>
                  {moment(msg.timestamp).format('MMMM D, YYYY')}
                </Text>
              </View>
            )}
            <View
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#ECECEC',
              borderRadius: 10,
              padding: 10,
              marginVertical: 4,
              maxWidth: '80%',
            }}

           
          >
            
        
            {msg.text && <Text>{msg.text}</Text>}
            {msg.image && (
              <TouchableOpacity onPress ={() =>{
                setSelectedImage(msg.image);

                setModalVisible(true);
              }}>
               

              
              <Image 
              source={{uri:msg.image}}
              style={{width:200, height:200, borderRadius:10, marginTop:5}}
              resizeMode='cover'
              />
              </TouchableOpacity>
            )}
            {msg.timestamp && (
            <Text style={{ 
              fontSize: 10, 
              color: 'gray', 
              alignSelf: 'flex-end', 
              marginTop: 5 
            }}>
              {moment(msg.timestamp).format('h:mm A')}
            </Text>
            )}
            </View>
          </View>
            );
        })}
      </ScrollView>
     

      <Modal visible={modalVisible} transparent={true}>
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
    <TouchableOpacity
      style={{ position: 'absolute', top: 40, right: 20 }}
      onPress={() => setModalVisible(false)}
    >
      <Text style={{ color: 'white', fontSize: 18 }}>Close ✖️</Text>
    </TouchableOpacity>

    {selectedImage && (
      <Image
        source={{ uri: selectedImage }}
        style={{ width: '90%', height: '70%', borderRadius: 20 }}
        resizeMode="contain"
      />
    )}
  </View>
  
</Modal>

<SafeAreaView style={styles.container}>
   
      <View style={styles.shadowWrapper} >
      <BlurView tint='systemChromeMaterialLight' intensity={4} style={styles.blurContainer}>
      
      <TextInput
        value={UserInput}
        onChangeText={setUserInput}
        placeholder="Type a message..."
        placeholderTextColor="white"
        style={styles.input}
        multiliner
      />
      
       
     
      </BlurView>
      </View>



      {UserInput.trim() ? (

        <View style = {{flexDirection:'row',alignItems:'center'}}>

        <TouchableOpacity onPress={() => handlesend()} style={styles.sendButton}>
        <FontAwesome name="paper-plane" size={20} color="#fff" />
      </TouchableOpacity>
      </View>

      ): (
        <View style = {{flexDirection:'row',alignItems:'center'}}>
       
      
      <TouchableOpacity style={styles.uploadButton}>
    <FontAwesome name="microphone" size={20} color="#fff" />
  </TouchableOpacity>

  <TouchableOpacity onPress ={uploadImage} style={styles.uploadButton}>
    <FontAwesome name="camera" size={20} color="#fff" />
  </TouchableOpacity>
  

  </View>
      )}
      
  
    </SafeAreaView>



{/* <View
  style={{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
  }}
>
  <TextInput
    style={{ height: 40, width: '80%' }}
    placeholder="Type your message..."
    value={UserInput}
    onChangeText={setUserInput}
  />
  
  <TouchableOpacity onPress={() => {console.log("Image icon pressed");uploadImage();}}>
   <FontAwesome name='image' />
  </TouchableOpacity>
   
  <Button title={isSending ? "Sent" : "Send"} onPress={() => handlesend()} disabled={isSending} />
 
</View> */}

</View>
</LinearGradient>
</KeyboardAvoidingView>
);

}

const styles = StyleSheet.create({

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    margin: 10,
    backgroundColor: 'rgba(23, 21, 21, 0.2)', // soft transparency for glassmorphism
    overflow: 'hidden',
    height: 100,
    width:'100%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    bottom:0,
    borderTopWidth:1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    position:'absolute',

  

    // Shadow (iOS)
    shadowColor: '#000',
    shadowOpacity: 10,
    shadowRadius: 100,
    shadowOffset: { width: 0, height: 10 },

    // Shadow (Android)
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: 'white',
    maxHeight: 50,

  },
  sendButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginLeft: 5,
    marginRight: 8,

    // Shadow for button
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  blurContainer: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 0,
    margingLeft:50,
   
    
  },
  uploadButton: {
  marginRight: 10,
  marginLeft: 10,
  },
  iconButton: {
    marginHorizontal: 4,
    padding: 10,
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  shadowWrapper: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 25,
    // Customize shadow spread/margin look
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10, // More = wider shadow spread
    shadowOffset: { width: 0, height: 1 },
    elevation: 8, // For Android shadow
    height:40,
    width: "100%",
    
    
    
  },

  })





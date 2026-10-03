import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Keyboard, TouchableWithoutFeedback, StyleSheet, FlatList, KeyboardAvoidingView, Pressable, Platform  } from 'react-native';
import {LinearGradient} from 'expo-linear-gradient'

export default function Chat(){

  const [messages, SetMessages] = useState([]);
  const [UserInput, SetUserInput] = useState('')
  const flatListRef = useRef(null)


  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
  const keyboardListener = Keyboard.addListener(
    'keyboardDidShow',
    () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  );

  return () => {
    keyboardListener.remove();
  };
}, []);


   const getMayaResponse = async () => {

    if (!UserInput.trim()){

       
      return;
    }
 

    SetMessages(previousMessages => [...previousMessages,

      {id: Date.now().toString(),
        sender: 'User',
        text:UserInput,
      }


    ]);

     SetUserInput('')

      try {
  const response = await axios.post('http://192.168.1.133:8000/maya',
  
  {message:UserInput,
   history: messages
  }
   

  )

  SetMessages(PreviousMessages => [...PreviousMessages,

    {id: (Date.now() + 1).toString(),
    sender:'maya',
    text:response.data.reply,
    }
  ]);

}   catch (error) {
    console.error('Error fetching Maya response:', error)
  }

    };


    const RenderMessage = ({item}) => {
       const isUser = item.sender === 'User';

       return (

        <View style = {[styles.messageRow, isUser ? styles.userMessageRow : styles.mayaMessageRow]}

        >

          <View style = {[styles.messageBubble, isUser ? styles.userBubble : styles.mayaBubble]}
          >
            <Text style = {styles.messageText}>

              {item.text}
            </Text>

            </View>

            </View>







       )
 



    }


return (
  <KeyboardAvoidingView
    style= {styles.container}
    behavior={Platform.OS === 'ios' ? "padding": undefined}
    keyboardVerticalOffset= {0}
    >
  
  
    <LinearGradient style={styles.GradientStyle} colors={['#0f0c29', '#302b63', '#24243e']} >
    <FlatList
    ref = {flatListRef}
    style = {{ flex: 1, width: '100%'}}
    data = {messages}
    renderItem={RenderMessage}
    keyExtractor = {item => item.id}
    contentContainerStyle={styles.messageList}
    keyboardDismissMode = "on-drag"

 
    />
    <View style ={styles.inputContainer}>
    <TextInput style = {styles.input} placeholder= 'Type your message here' value={UserInput} onChangeText={SetUserInput} placeholderTextColor = "black" onSubmitEditing = {getMayaResponse} onBlur = {() => {if (!UserInput.trim()) {SetUserInput('')};}} />
    <Pressable style = {styles.sendButton} onPress = {getMayaResponse}>

      <Text style = {styles.sendText}>Send</Text>
    </Pressable>
    </View>

  </LinearGradient>
  </KeyboardAvoidingView>






);

}


const styles = StyleSheet.create ({

  chatHeader: {
  alignItems: 'center',
  paddingVertical: 15,
},


companionText: {
  color: '#d0cde1',
  fontSize: 14,
},


  GradientStyle: {

    flex: 1
  },



 container: {
    flex: 1,
    backgroundColor: '#efeae2'
  },

  messageList: {
    paddingHorizontal: 12,
    paddingVertical: 15,
    justifyContent: 'flex-end',
    flexGrow: 1,
    paddingBottom: 20,
  },


  messageRow: {
    width: '100%',
    marginVertical: 4,
    flexDirection: 'column',
  },

  userMessageRow: {
    alignItems: 'flex-end'
  },

  mayaMessageRow: {
    alignItems: 'flex-start'
  },

  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14
  },

  userBubble: {
    backgroundColor: 'white'
  },

  mayaBubble: {
    backgroundColor: 'white'
  },

  messageText: {
    fontSize: 16,
    color: '#111'
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f0f2f5'
  },

  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: 'black'
  },

  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#a259ff'
  },

  sendText: {
    color: 'white',
    fontWeight: '600'
  }





})
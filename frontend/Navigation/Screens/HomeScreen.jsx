import {SafeAreaView, StyleSheet, Text, View, Image, ImageBackground, Button, ActivityIndicator, Alert, Switch, ScrollView,TouchableOpacity, Animated, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {FontAwesome} from '@expo/vector-icons';
import React, {useEffect, useState} from "react";
import {useNavigation} from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import {createContext,useContext} from 'react';
import {Modal} from 'react-native'
import {ThemeContext} from './Settings'



const ShowUsernameAndPasswordBox = ({visible,onClose}) => {
  const [user_name,setusername]=useState('')
  const [password,setpassword]=useState('')
  return (
  <Modal visible={visible} transparent animationType="fade" >
    <SafeAreaView style={styles.modalBackdrop}>
      <ScrollView contentContainerStyle ={styles.modalContent}>
        <View style ={{marginBottom:20}}>
      <Text style={{backgroundColor:'black',color:'white',width:300,textAlign:'center'}}>Login</Text>
      </View>
      
         <View style ={{marginBottom:50}}>
          <TextInput value = {user_name} onChangeText ={setusername} placeholder ="Username" style={styles.modalBody} placeholderTextColor ='black'/>
          </View>
          <View style = {{marginBottom:50}}>
          <TextInput value ={password} onChangeText={setpassword} placeholder = "Password" style={styles.modalBody} placeholderTextColor="black" />
          </View>
          <View style={{marginBottom:50}}>       
          <Text> Forgot password? </Text>
           </View>
           <TouchableOpacity style={{width:100}}> 
          <Text style={{backgroundColor:'#a259ff', borderRadius:25}}> Enter </Text>
          </TouchableOpacity>
         
        

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text> Close </Text>
      </TouchableOpacity>
      
    </ScrollView>
    </SafeAreaView>
    </Modal>


  )
}



function TypewriterText({ text, speed = 50, style,onFinish }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
  
    

     const interval = setInterval(() => {
        setIndex((prev) => {
           if (prev < text.length) return prev + 1;
           clearInterval(interval);
           if (onFinish) onFinish();
        
           return prev;
         });
       }, speed)

  
  }, [text, speed]);

  return <Text style={style}>{text.slice(0, index)}</Text>;
}
export default function HomeScreen({navigation}){


  const [LoginScreen,setShowLoginScreen] = useState(false);
  const [firstButtonOpacity] = useState(new Animated.Value(0));
  const [secondButtonOpacity] = useState(new Animated.Value(0));
  const [poweredByOpacity] = useState(new Animated.Value(0));
  const [CaptionOpacity]= useState(new Animated.Value(0))
 return (
  <>
    
  
      <LinearGradient style={styles.GradientStyle} colors={['#0f0c29', '#302b63', '#24243e']} >
      <StatusBar translucent={true} backgroundColor={"transparent"} style="light" />
      <SafeAreaView style={styles.safeArea}>
      
      <View style={{alignItems: 'center', marginBottom: 100}}>

       <TypewriterText style={{textAlign: 'center',marginRight:8,color: 'white',fontSize: 24,fontWeight: 'bold'}}
       text={"Welcome to"}
       speed={50} />
       <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
       <TypewriterText
       style={{color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center',position:'fixed'}}
       text="AI Dating Simulator"
       speed={50}

       onFinish ={()=>{setTimeout(()=>{Animated.timing(CaptionOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver:true,
       }).start();}, 300);
        
        
        setTimeout (() => {Animated.timing(firstButtonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();},1000);
                  setTimeout(()=>{Animated.timing(secondButtonOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                  }).start();},1700);
                  setTimeout ( () =>{Animated.timing(poweredByOpacity, {toValue: 1, duration: 500, useNativeDriver:true}). start();}, 2400);


       }}

       />
       
       </View>
      </View>
      <View style ={{marginTop:50}}>
        <Animated.View style= {{opacity:CaptionOpacity}}>
      <Text style ={{color:"white"}}>
          Real emotions, virtual connection
        </Text>
      </Animated.View>
      </View>
      
        <View style={{marginTop:200, marginBottom:-100}}>
        <Animated.View style = {{opacity:firstButtonOpacity}}>
        <TouchableOpacity onPress={()=>navigation.navigate('Progress')}>
         <Text style = {styles.ButtonStyle1}> Create Account </Text>
        
        </TouchableOpacity>
        </Animated.View>
        <Animated.View style ={{opacity:secondButtonOpacity}}>
        <TouchableOpacity onPress={()=>setShowLoginScreen(true)}>
        <Text style={styles.ButtonStyle2}> Login </Text>
        </TouchableOpacity>  
        </Animated.View>
        <ShowUsernameAndPasswordBox visible = {LoginScreen} onClose = {() => setShowLoginScreen(false)}/>
        <Animated.View style={{marginTop: 80, textAlign:'center',marginLeft:70, opacity:poweredByOpacity}}>
          <Text style={{color:'white'}}> Powered by AI Technology</Text>
        </Animated.View>
        </View>
       
        </SafeAreaView>
      
      </LinearGradient>
       
    
      </>
    
 );
}


const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginLeft:8,
    },
    ButtonStyle1: {
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 10,
        marginTop: 20,
        marginLeft:10,
        marginBottom:-10,
        width: 300,
        height:50,
       color: 'purple',
       textAlign:'center',
       lineHeight:30,
       fontSize:20
    },

    ButtonStyle2: {
      backgroundColor: '#a259ff',
      borderRadius: 30,
      padding: 10,
      marginTop: 20,
      marginLeft:10,
      width: 300,
      height: 50,
      
     color: 'white',
     textAlign:'center',
     lineHeight:30,
     fontSize:20
     
  },
    GradientStyle: {
      flex:1,
      

  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: 300,
    height:400,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  closeButton: {
    backgroundColor: '#5b2c83',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 80,
    flexDirection:"row"
  },

});
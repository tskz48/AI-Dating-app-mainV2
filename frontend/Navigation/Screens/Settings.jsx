
import {Switch, View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity} from  'react-native';
import {FontAwesome} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {useState} from 'react';
import {createContext,useContext} from 'react'


export default function Settings(){

const [isDarkMode,setIsDarkMode]=useState('false')
return (
  <LinearGradient style={styles.GradientStyle} colors={['#0f0c29', '#302b63', '#24243e']} >
  <SafeAreaView style ={styles.container} >
  
  <ScrollView>
  <FontAwesome name="cog" size={24} color="black" style={styles.icon} />
  <View style={styles.switchContainer}>
  <Text style = {{color:'white'}} > Dark Mode</Text>
  <Switch value = {isDarkMode} onValueChange={setIsDarkMode}/>
  </View>
  


<View>
<Text style = {{color:'white'}} >Sign Out</Text>
</View>
<View>
<TouchableOpacity>
<Text style = {{color:'white'}} >Delete Account</Text>
</TouchableOpacity>
</View>
<View style={{ position:'absolute',top:300,right:70,}}>
  <View>
<TouchableOpacity style ={{flexDirection:'row',alignItems:'center',marginBottom:20}}>
<FontAwesome style={{position:'relative',zIndex:5,top:15,left:55}} name="lock" color='black' size={20} />
<Text style={styles.ButtonStyle1}  >Privacy Policy</Text>
</TouchableOpacity>
</View>
<View>
<TouchableOpacity style={{flexDirection:'row',alignItems:'center',marginBottom:20}}>
<FontAwesome style ={{position:'relative', zIndex:5, left:55,top:15}} name="file-text-o" color='black' size={20} />
<Text style={styles.ButtonStyle1}  >Terms and Conditions</Text>
</TouchableOpacity>
</View>
<View>
<TouchableOpacity style={{flexDirection:'row',alignItems:'center',marginBottom:20}}>
<FontAwesome style ={{position:'relative', left:55, top:15, zIndex: 5}} name="life-ring" color='black' size={20} />
<Text style={styles.ButtonStyle1}  >Support</Text>
</TouchableOpacity>
</View>

 </View>
  </ScrollView>
  </SafeAreaView>
  </LinearGradient>



 )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  switchContainer: {
    flexDirection:'row',
    justifyContent:'space-between',
    paddingHorizontal:20,
  },

    GradientStyle: {
      flex:1,
    },
    icon: {
      alignSelf: 'center',
      marginBottom: 20,
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
     lineHeight:20,
     fontSize:20,
     borderWidth:3,
     borderColor: 'purple'
  },



  }
)
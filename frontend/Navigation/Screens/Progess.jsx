  
import * as Progress from 'react-native-progress';
import {Animated, Easing, Image, StyleSheet,View, Dimensions, TouchableOpacity, Text} from 'react-native';
import {LinearGradient}  from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import {createContext,useContext} from 'react'
import {ThemeContext} from './Settings'

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



 export default function ProgressBar({navigation}){

  const [progress,setProgress] = useState(0)


  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(progressInterval);
          return 1;
        }
        return prev + 0.01;
      });
    }, 10);
    return () => clearInterval(progressInterval);
  }, []);

 

  useEffect(() => {
    if (progress >= 1) {
      navigation.navigate('Hub');
    }
  }, [progress]);

 
    
   return(
    <LinearGradient style={styles.gradientStyle} colors = {['#0f0c29', '#302b63', '#24243e']}>  
  <View style ={{justifyContent:"center",alignItems:'center', flex:1}}>
  

      <Progress.Bar color= '#a259ff' height={8} width = {280} progress= {progress} />
       <Text style = {styles.Percentage}>
         {Math.round(progress * 100)}%
       </Text>
      <TypewriterText style={{textAlign: 'center',marginRight:8,color: 'white',fontSize: 24,fontWeight: 'bold'}}
      text="Your next digital crush is moments away..." 
      speed ={50}
      />

     
     
  </View>
  </LinearGradient>
 
 
  );
}
  



const styles = StyleSheet.create({


 
  gradientStyle: {
    flex:1,
    
  },

  Percentage: {
  color: 'rgba(255,255,255,0.7)',
  fontSize: 14,
  marginTop: 12,
}
});
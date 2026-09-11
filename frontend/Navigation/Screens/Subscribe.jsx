import {View,Text, Image, TouchableOpacity} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient'
import {ScrollView} from 'react-native'
import Feather from 'react-native-vector-icons/Feather'

export default function Subscribe () {
  const perks = ['Unlimited messages!',  'Unlimited image generation, NSFW included!'] 

  return (
    <LinearGradient style={{flex:1}} colors={['#0f0c29', '#302b63', '#24243e']}>
      <ScrollView>
    <View>

      <Image source={require('../../assets/avatar2.png')} style={{height:100,width:300}} />

  <View style ={{alignItems:'center'}}>
    <View>
      
        <View style={{flexDirection:'row',position:'absolute', top:60,left:-100, zIndex:5}}>
          <Text style ={{fontSize:16,marginRight:8, fontWeight:'bold'}}>• </Text>
          <Text style ={{fontSize:16,marginRight:8,fontWeight:'bold'}}>Unlimited messages! </Text>
          </View>
          <View style={{flexDirection:'row',position:'absolute', top:40,left:-100,zIndex:5}}>
          <Text style={{ fontSize: 16, fontWeight:'bold' }}>•</Text>
          <Text style={{ fontSize: 16,fontWeight:'bold' }}>Unlimited image generation, NSFW included!</Text>
          </View>
      
      
     
    </View>
  <View style= {{alignItems:'center', position:'absolute', top:100}} >
  <Text style ={{fontWeight:'bold', backgroundColor:'white', borderRadius: 25, height:100,width:200, textAlign:'center',verticalAlign:'center', lineHeight:100,paddingRight:10}}> Subscribe </Text>
  </View>
   <TouchableOpacity style ={{marginTop:250, alignItems:'center',position:'absolute', borderRadius:25, backgroundColor:'white', height:100,width:200, marginBottom:100}}>
  <Text style={{fontWeight:'bold'}}>Weekly</Text>
  <Text style={{fontWeight:'bold'}}>Buy!</Text>
  <Text style={{fontWeight:'bold'}}>$9.99</Text>
  </TouchableOpacity>
  <View style ={{marginTop:500, alignItems:'center',position:'absolute', borderRadius:25, backgroundColor:'white', height:100,width:200}}>
  <Text style={{fontWeight:'bold'}}> Monthly</Text>
  <Text style={{fontWeight:'bold'}}>Buy!</Text>
  <Text style={{fontWeight:'bold'}}>$14.99 </Text>
  </View>
  <View style ={{marginTop: 650, alignItems:'center', borderRadius:25, backgroundColor:'white', height:100,width:200}}>
  <Text style={{fontWeight:'bold'}}> Yearly</Text>
  <Text style={{fontWeight:'bold'}}>Buy!</Text>
  <Text style={{fontWeight:'bold'}}>$89.99 ( $7.50 per month)</Text>
  </View>

</View> 

<View style ={{flexDirection:'row', position:'relative', top: 10, left: 20}} >
<Text style={{fontWeight:'bold'}}>Terms and Conditions </Text>
<Text>| </Text>
<Text style={{fontWeight:'bold'}}> Privacy Policy </Text>
<Text>| </Text>
<Text style={{fontWeight:'bold'}}>Restore purchases </Text>
</View>
</View>
</ScrollView>
</LinearGradient>




  )


}
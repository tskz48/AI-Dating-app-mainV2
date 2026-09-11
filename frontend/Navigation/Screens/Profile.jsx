import {View, Text, StyleSheet} from 'react-native';
import * as Progress from 'react-native-progress';
import { LinearGradient } from 'expo-linear-gradient'
import {FontAwesome} from '@expo/vector-icons';;
import { BlurView } from 'expo-blur'
import {Pressable, Modal} from 'react-native';
import {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native';
import {createContext,useContext} from 'react'
import {ThemeContext} from './Settings'




const Achievements = ({visible,onClose}) =>{

  return (

   <Modal visible={visible} transparent animationType="fade" >
    <SafeAreaView style={styles.modalBackdrop}>
      <ScrollView contentContainerStyle ={styles.modalContent}>
      <Text style={styles.modalTitle}>Achievements</Text>
      
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>100</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity> 
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>100</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity> 
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>200</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>200</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>200</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>200</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>400</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>400</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>400</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>400</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>400</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.modalBody}>400</Text>
          <Text style={styles.modalBody}>Claim</Text>
          </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text> Close </Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
    </Modal>
    
  )

}



const GlassButton = ({onPress}) => {
  return (
    <View>
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
      <BlurView intensity={4} tint="systemChromeMaterialLight" style={styles.blurContainer}>
        <Text style={styles.text}>Achievements</Text>
        </BlurView>
      </TouchableOpacity> 
      <TouchableOpacity style={styles.buttonContainer} onPress={onPress}> 
      <BlurView intensity={4} tint="systemChromeMaterialLight" style={styles.blurContainer}>
        <Text style={styles.text}>Market</Text>
      </BlurView>
    </TouchableOpacity>
    </View>
  );
}

export default function Profile() {
  const [showAchievements, setShowAchievements] = useState(false);



 return (
   <LinearGradient style={styles.GradientStyle} colors={['#0f0c29', '#302b63', '#24243e']} >
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 30, color:'white' }}>Profile</Text>
      <Progress.Circle
        size={150}
        progress={0.4} // 40% progress statically for now
        showsText={true}
        color="#a259ff"
        borderWidth={4}
        thickness={10}
        textStyle={{ fontSize: 18, color:'white' }}
        formatText={() => '40%'}
      />
      <GlassButton onPress={() => setShowAchievements(true)}/>
      <Achievements visible={showAchievements} onClose={() => setShowAchievements(false)}/>
    </View>
    </LinearGradient>
  );

}

const styles= StyleSheet.create({
GradientStyle: {
  flex:1,
},
  buttonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    margin: 10,
  },

  blurContainer: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },

  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  modalBody: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    paddingVertical :10,
    marginLeft: 100
  },

  closeButton: {
    backgroundColor: '#5b2c83',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    flexDirection:"row"
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }


}
)
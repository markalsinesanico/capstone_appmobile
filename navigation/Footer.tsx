
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function Footer() {
  const navigation = useNavigation<NavigationProp>();

  const navigateToScreen = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => navigateToScreen('Home')} style={styles.iconBlock}>
        <FontAwesome name="home" size={20} color="white" />
        <Text style={styles.footerText}>HOME</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateToScreen('Rooms')} style={styles.iconBlock}>
        <FontAwesome5 name="door-open" size={20} color="white" />
        <Text style={styles.footerText}>ROOMS</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateToScreen('Profile')} style={styles.iconBlock}>
        <FontAwesome name="user" size={20} color="white" />
        <Text style={styles.footerText}>PROFILE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#007e3a',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 999,
  },
  iconBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
});
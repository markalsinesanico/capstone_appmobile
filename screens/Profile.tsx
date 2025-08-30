import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; // using FontAwesome5 for icons
import Header from '../navigation/Header';
import Footer from '../navigation/Footer';

export default function Profile() {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.profileSection}>
        <View style={styles.profileImg}>
          <FontAwesome5 name="user" size={40} color="white" />
        </View>
        <Text style={styles.emailText}>msanico@ssct.edu.ph</Text>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <FontAwesome5 name="receipt" size={20} />
            <Text>Receipt</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <FontAwesome5 name="history" size={20} />
            <Text>History</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <FontAwesome5 name="sign-out-alt" size={20} />
            <Text>Logout</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} />
        </TouchableOpacity>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bbe0cd',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007e3a',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 14,
    marginBottom: 20,
  },
  divider: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  menuItem: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

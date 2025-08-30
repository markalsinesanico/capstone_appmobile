import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function Header() {
  return (
    <View style={styles.header}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <View style={styles.textContainer}>
        <Text style={styles.headerTitle}>SMART LINK</Text>
        <Text style={styles.headerSubtitle}>APPOINT & BORROW</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#007e3a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  logo: {
    height: 50,
    width: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 10,
    letterSpacing: 1,
  },
});

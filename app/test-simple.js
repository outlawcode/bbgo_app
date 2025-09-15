import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestComponent = () => {
  console.log('TestComponent rendered successfully!');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Component Working!</Text>
      <Text style={styles.subtext}>No twrnc used here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default TestComponent;
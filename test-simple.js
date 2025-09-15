import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestComponent = () => {
  console.log('TestComponent loaded successfully');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Component Working!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  }
});

export default TestComponent;
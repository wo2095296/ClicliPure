import React from 'react'
import { Button, Text, View } from 'react-native'

export default function Anime(props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Anime!</Text>
      <Button title='Go to Details' onPress={() => props.navigation.navigate('Details')} />
    </View>
  )
}
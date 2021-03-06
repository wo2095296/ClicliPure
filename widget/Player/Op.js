import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { StyleSheet, View, Dimensions, Slider, Text, TouchableHighlight, BackHandler } from 'react-native'
import { Video } from 'expo-av'
import { ScreenOrientation } from 'expo'
import Icon from './Icon'
import RNIdle from 'react-native-idle'
const { width, height } = Dimensions.get('window')
const autoHeight = (width * 9) / 16

export default function OPlayer({ url, themeColor = '#946ce6', type = 'mp4', callback }) {
  if (!url) return <View style={s.unfull} />

  let v = useRef(null)
  let timer = null
  const [isPlay, setPlay] = useState(true)
  const [isFull, setFull] = useState(false)
  const [control, setControl] = useState(false)
  const [duration, setDuration] = useState(0)
  const [position, setPosition] = useState(0)

  useEffect(() => {
    v.current.loadAsync({ uri: url }).then(() => {
      v.current.playAsync()
      setPlay(true)
    })
    return () => v.current.unloadAsync()
  }, [url])
  useEffect(() => {
    RNIdle.disableIdleTimer()
    return () => {
      v.current.unloadAsync()
      RNIdle.enableIdleTimer() 
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
    }
  }, [])

  const play = useCallback(() => {
    isPlay ? v.current.pauseAsync() : v.current.playAsync()
    setPlay(!isPlay)
  })
  const full = useCallback(() => {
    if (isFull) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
    } else {
      callback.full && callback.full()
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT)
    }
    setFull(!isFull)
  })
  const back = useCallback(() => (isFull ? full() : callback.back && callback.back()))

  const update = useCallback(status => {
    setDuration(status.durationMillis)
    setPosition(status.positionMillis)
  })

  const value = useCallback(value => {
    v.current.setPositionAsync(value * duration)
    v.current.playAsync()
  })
  const show = useCallback(() => {
    setControl(true)
    clearTimeout(timer)
    timer = setTimeout(() => setControl(false), 5000)
  })

  const c = useMemo(() => {
    return control ? { opacity: 1 } : { opacity: 0 }
  })
  return (
    <TouchableHighlight onPress={show}>
      <View style={isFull ? s.full : s.unfull}>
        <Icon name={'back'} size={20} color={'#fff'} onPress={back} style={{ ...c, ...s.back }} />
        <View style={{ ...c, ...s.control }}>
          <Icon name={isPlay ? 'pause' : 'play'} size={20} color={'#fff'} onPress={play} style={s.icon} />
          <Text style={s.text}>{timefy(position)}</Text>
          <Slider
            value={duration && position ? position / duration : 0}
            style={{ height: 40, flex: 1 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor={themeColor}
            maximumTrackTintColor='rgba(255,255,255,0.5)'
            thumbTintColor={themeColor}
            onValueChange={() => v.current.pauseAsync()}
            onSlidingComplete={value}
          />
          <Text style={s.text}>{timefy(duration)}</Text>
          <Icon name={'full'} size={20} color={'#fff'} onPress={full} style={s.icon} />
        </View>
        <Video rate={1.0} volume={1.0} isMuted={false} resizeMode='contain' shouldPlay style={s.video} ref={v} onPlaybackStatusUpdate={update} />
      </View>
    </TouchableHighlight>
  )
}

const timefy = millis => {
  if (!millis) return '00:00'
  const t = millis / 1000
  const s = String(Math.floor(t % 60))
  const m = String(Math.floor(t / 60))
  return m.padStart(2, '0') + ':' + s.padStart(2, '0')
}

const s = StyleSheet.create({
  video: {
    width: '100%',
    height: '100%'
  },
  control: {
    position: 'absolute',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    bottom: 10
  },
  full: {
    width: height,
    height: width
  },
  unfull: {
    width,
    height: autoHeight
  },
  back: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 9999
  },
  icon: {
    margin: 10
  },
  text: {
    color: '#fff'
  }
})

import React, { useEffect, useState } from "react";
import * as TalkPlus from "./talkplus-rn-0.5.1.js";
import {
  Button,
  StyleSheet,
  View,
} from "react-native";
import {
  RTCView,
  registerGlobals,
} from 'react-native-webrtc';

const APP_ID = "YOUR_APP_ID";
const DEMO_CHANNEL_ID = "YOUR_CHANNEL_ID";

let client;
let localStreamCopy;
let localVideoTrack;
let localAudioTrack;

const TalkTest = () => {
  const [displayLoginScreen, setDisplayLoginScreen] = useState(true);
  const [calleeId, setCalleeId] = useState("");

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // must call this function in order for WebRTC functions in TalkPlus SDK to work!
  registerGlobals();

  useEffect(() => {
    if (!client || !client.isLoggedIn()) {
      client = new TalkPlus.Client({ appId: APP_ID });

      // 영상 통화가 성공적으로 연결됨
      client.call.on("connected", (callInfo) => {
        console.log('call connected');
        const { channelId, callerId, calleeId, trackEvent } = callInfo;
        if (trackEvent.streams.length) {
          setRemoteStream(trackEvent.streams[0])
        }
      });

      // 영상 통화 요청이 옴
      client.call.on("incoming", (callInfo) => {
        const { channelId, callerId, calleeId } = callInfo;
        console.log(`Incoming call from ${callerId}`);
        client.acceptCall({mediaStream: localStreamCopy});
      });

      // 영상 통화 종료/거절/취소
      client.call.on("ended", (callInfo) => {
        const { channelId, callerId, calleeId, endReasonCode, endReasonMessage } = callInfo;
        console.log(`call ended: ${endReasonMessage}`);
        setRemoteStream(null);
      });

      // 영상통화 연결이 비정상적으로 끊김
      client.call.on("failed", (callInfo) => {
        const { channelId, callerId, calleeId } = callInfo;
        console.log(`failed: channelId: ${channelId}`);
        setRemoteStream(null);
      });
    }
  }, []);

  const handleUserLogin = async (userId) => {
    if (userId === "test1") {
      setCalleeId("test2");
    } else {
      setCalleeId("test1");
    }
    try {
      await client.loginAnonymous({
        userId: userId,
        username: userId,
      });
    } catch(err) {
      console.error("error:", err);
    }
    
    try {
      await client.joinChannel({ channelId: DEMO_CHANNEL_ID });
    } catch (err) {
      // create channel if channel does not exist
      await client.createChannel({
        channelId: DEMO_CHANNEL_ID,
        name: DEMO_CHANNEL_ID,
        type: TalkPlus.ChannelTypeEnum.Public,
        members: [],
      });
    }
    
    await showLocalVideo();
    setDisplayLoginScreen(false);
  };

  const showLocalVideo = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    setLocalStream(localStream)

    localStreamCopy = localStream;
    localVideoTrack = localStream.getVideoTracks()[0];
    localAudioTrack = localStream.getAudioTracks()[0];
  };

  const showRemoteVideo = async () => {
    await client.makeCall({ channelId: DEMO_CHANNEL_ID, calleeId, mediaStream: localStream});
  };

  const endCall = async () => {
    await client.endCall();
    setRemoteStream(null);
  };

  const toggleLocalVideo = async() => {
    if (localVideoTrack) {
      localVideoTrack.enabled = !localVideoTrack.enabled
    }
  };

  const toggleLocalAudio = async() => {
    if (localAudioTrack) {
      localAudioTrack.enabled = !localAudioTrack.enabled
    }
  };

  return (
    <View style={styles.container}>
      {displayLoginScreen ? (
        <View style={styles.login_container}>
          <View style={styles.button}>
            <Button
              title="User1"
              onPress={() => {
                handleUserLogin("test1");
              }}
            />
          </View>
          <View style={styles.button}>
            <Button
              title="User2"
              onPress={() => {
                handleUserLogin("test2");
              }}
            />
          </View>
        </View>
      ) : (
        <View style={styles.video_container}>

            {
              localStream && 
              <RTCView streamURL={localStream.toURL()} objectFit={'cover'}  style={styles.video} />
            }
            {
              remoteStream && 
              <RTCView streamURL={remoteStream.toURL()} objectFit={'cover'} style={styles.video} />
            }
            {
              !remoteStream && 
              <View style={styles.video} />
            }
            {
              remoteStream && 
              <View>
                <Button title="End" onPress={endCall} />
                <Button title="ToggleVideo" onPress={toggleLocalVideo} />
                <Button title="ToggleAudio" onPress={toggleLocalAudio} />
            </View>   
            }
          <View style={styles.button}>
          {!remoteStream && 
            <Button title="Call" onPress={showRemoteVideo} />
          }
          </View>
          
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: "#fff",
  },
  login_container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: "stretch",
    gap: 4,
    justifyContent: "center",
  },
  video_container: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    flexDirection: 'column',
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    flex: 7,
    width: '100%',
    backgroundColor: 'light-grey',
    borderWidth: 1,
    borderColor: 'black',
  },
  button: {
    flex: 1,
    justifyContent: "center",
  },
});

export default TalkTest;
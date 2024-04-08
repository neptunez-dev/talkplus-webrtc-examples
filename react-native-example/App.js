import React, { useEffect, useState } from "react";
import * as TalkPlus from "./talkplus-rn-0.5.0-beta7.js";
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
  const [targetUserId, setTargetUserId] = useState("");

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // must call this function in order for WebRTC functions in TalkPlus SDK to work!
  registerGlobals();

  useEffect(() => {
    if (!client || !client.isLoggedIn()) {
      client = new TalkPlus.Client({ appId: APP_ID });

      client.call.on("connected", (event) => {
        console.log('connected:', event);
        if (event.streams.length) {
          setRemoteStream(event.streams[0])
        }
      });

      client.call.on("incoming", (payload) => {
        console.log('incoming:', payload);
        client.acceptCall({mediaStream: localStreamCopy});
      });

      client.call.on("disconnected", (event) => {
        console.log('disconnected:', event);
        setRemoteStream(null);
      });

      client.call.on("rejected", () => {
        console.log('rejected:');
      });
    }
  }, []);

  const handleUserLogin = async (userId) => {
    if (userId === "test1") {
      setTargetUserId("test2");
    } else {
      setTargetUserId("test1");
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
    await client.makeCall({ channelId: DEMO_CHANNEL_ID, targetUserId, mediaStream: localStream});
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
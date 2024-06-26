import { useEffect, useState } from "react";
import RTCVideo from './RTCVideo';
import * as TalkPlus from "talkplus-sdk";
import './css/common.css'

const APP_ID = "YOUR_APP_ID";
const DEMO_CHANNEL_ID = "YOUR_CHANNEL_ID";

let client : TalkPlus.Client;
let localStreamCopy;
let localVideoTrack;
let localAudioTrack;

const TalkTest = () => {
  const [displayLoginScreen, setDisplayLoginScreen] = useState(true);
  const [inCallStatus, setInCallStatus] = useState(false);
  const [calleeId, setCalleeId] = useState("");

  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  useEffect(() => {
    console.log(
      "TalkPlus client는 최초에 한번만 초기화하고 재사용하시면 됩니다",
    );

    if (!client || !client.isLoggedIn()) {
      client = new TalkPlus.Client({ appId: APP_ID });

      // 영상 통화가 성공적으로 연결됨
      client.call.on("connected", (callInfo: any) => {
        console.log('video call connected');
        const { channelId, callerId, calleeId, trackEvent } = callInfo;
        if (trackEvent.streams.length) {
          setRemoteStream(trackEvent.streams[0]);
        }
      });

      // 영상 통화 요청이 옴
      client.call.on("incoming", (callInfo: any) => {
        const { channelId, callerId, calleeId } = callInfo;
        console.log(`video call incoming from ${callerId}`);
        client.acceptCall({mediaStream: localStreamCopy}); // WebRTC 영상 요청 수락
        setInCallStatus(true);
      });

      // 영상 통화 종료/거절/취소
      client.call.on("ended", (callInfo) => {
        const { channelId, callerId, calleeId, endReasonCode, endReasonMessage } = callInfo;
        console.log(`video call ended: ${endReasonMessage}`);
        setInCallStatus(false);
      });

      // 영상통화 연결이 비정상적으로 끊김
      client.call.on("failed", (callInfo) => {
        const { channelId, callerId, calleeId } = callInfo;
        console.log(`video call connection failed: ${channelId}`);
        setInCallStatus(false);
      });
    }
  }, []);

  const handleTestUserLogin = async (userId: string) => {
    // 'test1' 또는 'test2' 사용자로 익명 로그인
    if (userId === "test1") {
      setCalleeId("test2");
    } else {
      setCalleeId("test1");
    }

    await client
      .loginAnonymous({
        userId: userId,
        username: userId,
      })
      .then((data) => {})
      .catch((err) => console.error("error:", err));

    // 채널이 있을 경우 join. 채널이 없을 경우 생성.
    try {
      await client.joinChannel({ channelId: DEMO_CHANNEL_ID });
    } catch (err) {
      await client.createChannel({
        channelId: DEMO_CHANNEL_ID,
        name: DEMO_CHANNEL_ID,
        type: TalkPlus.ChannelTypeEnum.Public,
        members: [],
      });
    }

    // 사용자 영상 표시
    await showLocalVideo();
  };

  // 사용자 영상 표시
  const showLocalVideo = async () => {
    setDisplayLoginScreen(false);

    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setLocalStream(localStream);
    localStreamCopy = localStream;
    localVideoTrack = localStream.getVideoTracks()[0];
    localAudioTrack = localStream.getAudioTracks()[0];
  };

  // 영상 통화 요청
  const makeCall = async () => {
    await client.makeCall({ channelId: DEMO_CHANNEL_ID, calleeId, mediaStream: localStream});
    setInCallStatus(true);
  };

  // 영상 통화 종료
  const endCall = async () => {
    await client.endCall();
    setInCallStatus(false);
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
    <div className="wrap">
      {displayLoginScreen ? (
        <div id="login-window" className="btn-box">
          <button id="user-one-login-button" className="btn"
            type="button"
            onClick={() => {
              handleTestUserLogin("test1");
            }}
          >
            Login as Test User 1
          </button>
          <button id="user-two-login-button" className="btn"
            type="button"
            onClick={() => {
              handleTestUserLogin("test2");
            }}
          >
            Login as Test User 2
          </button>
        </div>
      ) : (
        <div id="container">
          <div className="video-box">
            <RTCVideo mediaStream={localStream} />
            <RTCVideo mediaStream={remoteStream} />
          </div>
          <div className="btn-box type2">
            <button id="callButton" className="btn" onClick={makeCall} disabled={inCallStatus}>Call</button>
            <button id="hangupButton" className="btn" onClick={endCall} disabled={!inCallStatus}>Hang Up</button>
            <button id="toggleVideo" className="btn" onClick={toggleLocalVideo} disabled={!inCallStatus}>ToggleVideo</button>
            <button id="toggleAudio" className="btn" onClick={toggleLocalAudio} disabled={!inCallStatus}>ToggleAudio</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalkTest;

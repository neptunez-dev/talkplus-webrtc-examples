## 기본 설정
#### 라이브러리 버전
이 샘플 React Native 샘플 프로젝트는 다음 라이브러리들을 사용합니다:
- [talkplus-rn-0.5.0-beta6.js](https://asset.talkplus.io/react-native/talkplus-rn-0.5.0-beta6.js)
- expo 
- react-native-webrtc
- @config-plugins/react-native-webrtc
이 [페이지](https://github.com/expo/config-plugins/tree/main/packages/react-native-webrtc) 에서 호환되는 라이브러리 버전을 확인하시기 바랍니다.

#### Globals 등록
톡플러스 React Native SDK는 브라우저 기반 WebRTC 함수를 사용하고 있습니다.
'react-native-webrtc' 라이브러리의 다음 함수를 호출해야 합니다 ([참고](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/BasicUsage.md#registering-globals))
```javascript
registerGlobals();
```

---

## Functions
#### 영상통화 요청 (기본 constraints 설정 사용: audio: true, video: true)
```javascript
client.makeCall({
    channelId: 'channelId', 
    targetUserId: 'targetUserId',
});
```
#### 영상통화 요청 (constraints 또는 MediaTrackConstraints 사용)
참고: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
```javascript
client.makeCall({
    channelId: 'channelId', 
    targetUserId: 'targetUserId', 
    constraints: {
        audio: false, 
        video: true,
    }
});
```
#### 영상통화 수락 (기본 설정 사용: audio: true, video: true)
```javascript
client.acceptCall();
```
#### 영상통화 수락 (constraints 또는 MediaTrackConstraints 사용)
참고: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
```javascript
client.acceptCall({
    audio: false,
    video: true,
});
```
#### 영상통화 거절
```javascript
client.rejectCall();
```
#### 영상통화 종료
```javascript
client.endCall();
```
## Events
#### 영상통화 요청
```javascript
client.call.on("incoming", (event) => {
    if (confirm(`Accept incoming call from ${event.userId} on channel: ${event.channelId}?`)) {
        client.acceptCall({audio: false, video: true});

    } else {
        client.rejectCall();
    }
});
```
#### 영상통화 연결 성공
```javascript
client.call.on("connected", (event) => {
    if (event.streams.length) {
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        remoteVideo.controls = true;
    }

    event.track.onmute = function (event) {
        console.log("Track muted");
    };

    event.track.onended = function (event) {
        console.log("Track ended");
    };
});
```
#### 상대방이 영상통화 요청을 거절
```javascript
client.call.on("rejected", ({event}) => {
    console.log("rejected");
});
```
#### 영상통화 연결 종료
```javascript
client.call.on("disconnected", (event) => {
    console.log("disconnected");
});
```
#### 영상통화 연결 상태 변경
```javascript
client.call.on("statuschanged", (event) => {
    console.log("connection status changed:", event);
});
```
#### 영상통화 연결 에러
```javascript
client.call.on("error", (event) => {
    console.log("error");
});
```
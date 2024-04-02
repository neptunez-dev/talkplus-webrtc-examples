## SDK
- `js-example`은 [talkplus-0.5.0-beta.6](https://asset.talkplus.io/npm/talkplus-0.5.0-beta.6) 을 사용합니다.
- `react-example` [TalkPlus JS SDK v0.5.0-beta6](https://www.npmjs.com/package/talkplus-sdk) 을 사용합니다.
- `react-native-example`은 이 [가이드](https://github.com/neptunez-dev/talkplus-webrtc-examples/blob/main/README.md) 참고 부탁드립니다

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
client.call.on("statechanged", (event) => {
    console.log("connection state changed:", event);
});
```
#### 영상통화 연결 에러
```javascript
client.call.on("error", (event) => {
    console.log("error");
});
```
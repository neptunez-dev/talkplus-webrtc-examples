## SDK
- `js-example`은 >=[talkplus-0.5.4](https://asset.talkplus.io/npm/talkplus-0.5.4) 을 사용합니다.
- `react-example` >=[TalkPlus JS SDK v0.5.4](https://www.npmjs.com/package/talkplus-sdk) 을 사용합니다.
- `react-native-example`은 이 [가이드](https://github.com/neptunez-dev/talkplus-webrtc-examples/blob/main/react-native-example/README.md) 참고 부탁드립니다

## Functions
#### 현재 영상통화 중 상태 확인
```javascript
const isCurrenlyInCall = client.isInCall();
```
#### 영상통화 요청 (기본 constraints 설정 사용: audio: true, video: true)
```javascript
const { callerId, calleeId, channelId } = await client.makeCall({
    channelId: 'channelId',
    calleeId: 'calleeId',
});
```
#### 영상통화 요청 (constraints 또는 MediaTrackConstraints 사용)
참고: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
```javascript
const { callerId, calleeId, channelId } =  await client.makeCall({
    channelId: 'channelId',
    calleeId: 'calleeId', 
    constraints: {
        audio: false, 
        video: true,
    }
});
```
#### 영상통화 요청 (직접 관리하는 MediaStream 사용)
```javascript
const localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
});
const { callerId, calleeId, channelId } = await client.makeCall({
    channelId: 'channelId',
    calleeId: 'calleeId',
    mediaStream: localStream,
});
```
#### 영상통화 수락 (기본 설정 사용: audio: true, video: true)
```javascript
const { callerId, calleeId, channelId } = await client.acceptCall();
```
#### 영상통화 수락 (constraints 또는 MediaTrackConstraints 사용)
참고: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
```javascript
const { callerId, calleeId, channelId } = await client.acceptCall({constraint: {
        audio: false,
        video: true,
    }
});
```
#### 영상통화 수락 (직접 관리하는 MediaStream 사용)
```javascript
const { callerId, calleeId, channelId } = await client.acceptCall({
    mediaStream: myLocalMediaStream,
});
```
#### 영상통화 종료/거절/취소
```javascript
const { callerId, calleeId, channelId } = client.endCall();
```
## Events
#### 영상통화 요청 이벤트 핸들링
```javascript
client.call.on("incoming", async (callInfo) => {
    const { channelId, callerId, calleeId } = callInfo;
    if (confirm(`Accept incoming call from ${callerId} on channel: ${channelId}?`)) {
        await client.acceptCall({audio: false, video: true});

    } else {
        client.endCall();
    }
});
```
#### 영상통화 연결 성공 이벤트 핸들링
```javascript
client.call.on("connected", (callInfo) => {
    const { channelId, callerId, calleeId, trackEvent } = callInfo;
    if (trackEvent.streams.length) {
        remoteVideo.srcObject = trackEvent.streams[0];
        remoteVideo.autoplay = true;
        remoteVideo.controls = true;
    }

    trackEvent.track.onmute = function (event) {
        console.log("Track muted");
    };

    trackEvent.track.onended = function (event) {
        console.log("Track ended");
    };
});
```
#### 영상통화 종료/거절/취소 이벤트 핸들링
```javascript
client.call.on("ended", (callInfo) => {
    const { channelId, callerId, calleeId, endReasonCode, endReasonMessage } = callInfo;
    if (endReasonCode === 0) {
        // endReasonCode === 0, 비정상 정료 (Unknown)
    } if (endReasonCode === 1) {
        // endReasonCode === 1, 정상 종료
    } else if (endReasonCode === 2) {
        // endReasonCode === 2, callee가 거절
    } else if (endReasonCode === 3) {
        // endReasonCode === 3, caller가 취소 
    }
    console.log(`call ended: ${endReasonMessage}`);
});
```
#### 영상통화 연결 실패. 재연결이 불가능하며 다시 처음부터 영상통화 시도를 해야 함. 
```javascript
client.call.on("failed", (callInfo) => {
    const { channelId, callerId, calleeId } = callInfo;
    console.log(`connection failed: channelId: ${channelId}`);
});
```
#### 영상통화 연결 상태 변경
```javascript
client.call.on("statechanged", (callInfo) => {
    const { channelId, callerId, calleeId, state } = callInfo;
    console.log("connection state changed:", state);
});
```
#### 영상통화 연결 에러
```javascript
client.call.on("error", (callInfo) => {
    const { channelId, callerId, calleeId, error } = callInfo;
    console.error("error:", error);
});
```

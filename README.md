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
    if (confirm(`Accept incoming call from ${event.userId}?`)) {
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
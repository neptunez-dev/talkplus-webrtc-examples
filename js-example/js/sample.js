const APP_ID = "YOUR_APP_ID";
const DEMO_CHANNEL_ID = "YOUR_CHANNEL";

let client;
let localStream;
let localVideoTrack;
let localAudioTrack;
let currentUserId;

let remoteVideo = document.getElementById("remoteVideo");

$(document).ready(() => {
  showLoginWindow();
});

function showVideoWindow() {
  $("#login-window").hide();
  $("#container").show();

  $("#callButton").on("click", () => {
    call();
  });
  $("#hangupButton").on("click", () => {
    endCall();
  });
  $("#toggleVideoButton").on("click", () => {
    if (localVideoTrack) {
      localVideoTrack.enabled = !localVideoTrack.enabled;
    }
  });
  $("#toggleAudioButton").on("click", () => {
    if (localAudioTrack) {
      localAudioTrack.enabled = !localAudioTrack.enabled;
    }
  });
}

function showLoginWindow() {
  $("#login-window").show();
  $("#container").hide();

  setupLoginButtonEventListener();
}

function login(userId) {
  currentUserId = userId;

  client = new TalkPlus.Client({ appId: APP_ID });

  // 영상통화가 성공적으로 연결됨
  client.call.on("connected", (callInfo) => {
    const { channelId, callerId, calleeId, trackEvent } = callInfo;
    if (trackEvent.streams.length) {
      setButtonsToCalledState();

      remoteVideo.srcObject = trackEvent.streams[0];
      remoteVideo.autoplay = true;
      remoteVideo.controls = true;
    }

    trackEvent.track.onmute = function (event) {
      console.log("Track muted");
      remoteVideo.play();
    };

    trackEvent.track.onended = function (event) {
      console.log("Track ended");
      setButtonsToStartedState();
    };
  });

  // 영상통화 요청이 옴
  client.call.on("incoming", (callInfo) => {
    const { channelId, callerId, calleeId } = callInfo;
    if (confirm(`Accept incoming call from ${callerId}?`)) {
      client.acceptCall({mediaStream: localStream});
      setButtonsToCalledState();
    } else {
      client.endCall();

      setButtonsToStartedState();
    }
  });

  // 영상통화 종료/거절/취소
  client.call.on("ended", (callInfo) => {
    const { channelId, callerId, calleeId, endReasonCode, endReasonMessage } = callInfo;
    console.log(`call ended: ${endReasonMessage}`);
    document.getElementById("remoteVideo").innerHTML = "";
    setButtonsToStartedState();
  });

  // 영상통화 연결이 비정상적으로 끊김
  client.call.on("failed", (callInfo) => {
    const { channelId, callerId, calleeId } = callInfo;
    console.log(`connection failed: channelId: ${channelId}`);
    document.getElementById("remoteVideo").innerHTML = "";
    setButtonsToStartedState();
  });

  // 영상통화 연결 상태 변경
  client.call.on("statechanged", (callInfo) => {
    const { channelId, callerId, calleeId, state } = callInfo;
    console.log("connection state changed:", state);
  });

  client.loginAnonymous(
    { userId: userId, username: userId },
    (errResp, data) => {
      if (errResp) {
        return alert(JSON.stringify(errResp));
      }

      // join demo channel
      client.joinChannel({ channelId: DEMO_CHANNEL_ID }, (errResp, data) => {
        if (errResp) {
          if (errResp.code === "2003") {
            // if channel not found, create it
            client.createChannel(
              {
                channelId: DEMO_CHANNEL_ID,
                name: DEMO_CHANNEL_ID,
                type: "super_public",
                // members: ['test1', 'test2'],
              },
              (errResp, data) => {
                if (errResp) {
                  return alert(JSON.stringify(errResp));
                }
              },
            );
          } else if (errResp.code === "2008") {
            // if user already had joined channel before, don't worry about error
            // don't handle
          } else {
            return alert(JSON.stringify(errResp));
          }
        }
      });
    },
  );

  start();
}

function setupLoginButtonEventListener() {
  $("#user-one-login-button").on("click", () => {
    login("test1");
    showVideoWindow();
  });

  $("#user-two-login-button").on("click", () => {
    login("test2");
    showVideoWindow();
  });
}

async function start() {
  setButtonsToStartedState();

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  document.getElementById("localVideo").srcObject = stream;
  localStream = stream;

  localVideoTrack = stream.getVideoTracks()[0];
  localAudioTrack = stream.getAudioTracks()[0];
}

function setButtonsToStartedState() {
  $("#callButton").attr("disabled", false);
  $("#hangupButton").attr("disabled", true);
  $("#toggleVideoButton").attr("disabled", true);
  $("#toggleAudioButton").attr("disabled", true);
}

async function call() {
  setButtonsToCalledState();

  const calleeId = currentUserId === "test1" ? "test2" : "test1";
  console.log("calleeId:", calleeId);
  await client.makeCall({ channelId: DEMO_CHANNEL_ID, calleeId, mediaStream: localStream });
}

function setButtonsToCalledState() {
  $("#callButton").attr("disabled", true);
  $("#hangupButton").attr("disabled", false);
  $("#toggleVideoButton").attr("disabled", false);
  $("#toggleAudioButton").attr("disabled", false);
}

function endCall() {
  setButtonsToStartedState();
  client.endCall();
}

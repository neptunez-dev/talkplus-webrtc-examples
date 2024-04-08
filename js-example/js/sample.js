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

  client.call.on("connected", (event) => {
    console.log("connected");
    if (event.streams.length) {
      setButtonsToCalledState();

      remoteVideo.srcObject = event.streams[0];
      remoteVideo.autoplay = true;
      remoteVideo.controls = true;
    }

    event.track.onmute = function (event) {
      console.log("Track muted");
      remoteVideo.play();
    };

    event.track.onended = function (event) {
      console.log("Track ended");
      setButtonsToStartedState();
    };
  });

  client.call.on("disconnected", (event) => {
    console.log("disconnected");
    document.getElementById("remoteVideo").innerHTML = "";
  });

  client.call.on("statechanged", (ev) => {
    console.log("connection state changed:", ev);
  });

  client.call.on("incoming", (event) => {
    console.log("incoming:", event);
    if (confirm(`Accept incoming call from ${event.userId}?`)) {
      client.acceptCall({mediaStream: localStream});
      setButtonsToCalledState();
    } else {
      client.rejectCall();

      setButtonsToStartedState();
    }
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

  const targetUserId = currentUserId === "test1" ? "test2" : "test1";
  console.log("targetUserId:", targetUserId);
  await client.makeCall({ channelId: DEMO_CHANNEL_ID, targetUserId, mediaStream: localStream });
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

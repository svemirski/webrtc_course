import * as store from "./store.js";
import * as wss from "./wss.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js"
import * as strangerUtils from "./strangerUtils.js";

// initialization of socket.io connection
const socket = io("/");
wss.registerSocketEvents(socket);

webRTCHandler.getLocalPreview();

// registering event for personal code copy button
const personalCodeCopyButton = document.getElementById("personal_code_copy_button");
personalCodeCopyButton.addEventListener("click", () => {
    const personalCode = store.getState().socketId;
    navigator.clipboard.writeText(personalCode);
})

// register event listeners for connection buttons
const personalCodeChatButton = document.getElementById("personal_code_chat_button");
const personalCodeVideoButton = document.getElementById("personal_code_video_button")
personalCodeChatButton.addEventListener("click", () => {
    const calleePersonalCode = document.getElementById("personal_code_input").value;
    const callType = constants.callType.CHAT_PERSONAL_CODE
    webRTCHandler.sendPreOffer(calleePersonalCode, callType);
})
personalCodeVideoButton.addEventListener("click", () => {
    const calleePersonalCode = document.getElementById("personal_code_input").value;
    const callType = constants.callType.VIDEO_PERSONAL_CODE
    webRTCHandler.sendPreOffer(calleePersonalCode, callType);
})

const strangerChatButton = document.getElementById("stranger_chat_button");
strangerChatButton.addEventListener("click", () => {
    strangerUtils.getStrangerSocketIdAndConnect(constants.callType.CHAT_STRANGER);
})
const strangerVideoButton = document.getElementById("stranger_video_button");
strangerVideoButton.addEventListener("click", () => {
    strangerUtils.getStrangerSocketIdAndConnect(constants.callType.VIDEO_STRANGER);
})

// register event for allow connections from strangers
const checkbox = document.getElementById("allow_strangers_checkbox");
checkbox.addEventListener("click", () => {
    const checkBoxStatus = store.getState().allowConnectionsFromStrangers;
    ui.updateStrangerCheckBox(!checkBoxStatus);
    store.setAllowConnectionsFromStrangers(!checkBoxStatus);
    strangerUtils.changeStrangerConnectionStatus(!checkBoxStatus);
})

// event listeners for video call button
const micButton = document.getElementById("mic_button");

micButton.addEventListener("click", () => {
    const localStream = store.getState().localStream;
    const micEnabled = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !micEnabled;
    ui.updateMicButton(micEnabled);
});

const cameraButton = document.getElementById("camera_button");

cameraButton.addEventListener("click", () => {
    const localStream = store.getState().localStream;
    const cameraEnabled = localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;
    ui.updateCameraButton(cameraEnabled);
});

const switchForScreenSharingButton = document.getElementById("screen_sharing_button");
switchForScreenSharingButton.addEventListener("click", () => {
    const screenSharingActive = store.getState().screenSharingActive;
    webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
});

// messenger

const newMessageInput = document.getElementById("new_message_input");
newMessageInput.addEventListener("keydown", (event) => {
    console.log("change occurred");
    const key = event.key;
    if (key === "Enter") {
        webRTCHandler.sendMessageUsingDataChannel(event.target.value);
        ui.appendMessage(event.target.value, true);
        newMessageInput.value = "";
    };
});

const sendMessageButton = document.getElementById("send_message_button")
sendMessageButton.addEventListener("click", () => {
    const message = newMessageInput.value;
    webRTCHandler.sendMessageUsingDataChannel(message);
    newMessageInput.value = "";
    ui.appendMessage(message, true);
});

// hang up
const hangUpButton = document.getElementById("hang_up_button");
hangUpButton.addEventListener("click", () => {
    webRTCHandler.handleHangUp();
});

const hangUpChatButton = document.getElementById("finish_chat_call_button");
hangUpChatButton.addEventListener("click", () => {
    webRTCHandler.handleHangUp();
});

import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";
import * as strangerUtils from "./strangerUtils.js";

let socketIO = null;

export const registerSocketEvents = (socket) => {
    socketIO = socket;

    socket.on("connect", () => {
        store.setSocketId(socket.id);
        ui.updatePersonalCode(socket.id);
    });    

    socket.on("pre-offer", (data) => {
        webRTCHandler.handlePreOffer(data);
    });

    socket.on("pre-offer-answer", (data) => {
        webRTCHandler.handlePreOfferAnswer(data);
    });

    socket.on("webRTC-signalling", (data) => {
        switch (data.type) {
            case constants.webRTCSignalling.OFFER:
                webRTCHandler.handleWebRTCOffer(data);
                break;
            case constants.webRTCSignalling.ANSWER:
                webRTCHandler.handleWebRTCAnswer(data);
                break;
            case constants.webRTCSignalling.ICE_CANDIDATE:
                webRTCHandler.handleWebRTCCandidate(data);
                break;
            default:
                return;
        };
    });

    socket.on("stranger-socket-id", (data) => {
        strangerUtils.connectWithStranger(data);
    });

    socket.on("user-hanged-up", () => {
        webRTCHandler.handleConnectedUserHangedUp();
    });
};

export const sendPreOffer = (data) =>  {
    socketIO.emit("pre-offer", data);
};

export const sendPreOfferAnswer = (data) => {
    socketIO.emit("pre-offer-answer", data);
};

export const sendDataUsingWebRTCSignalling = (data) => {
    socketIO.emit("webRTC-signalling", data);
};

export const sendUserHangedUp = (data) => {
    socketIO.emit("user-hanged-up", data);
};

export const changeStrangerConnectionStatus = (data) => {
    socketIO.emit("stranger-connection-status", data);
};

export const getStrangerSocketId = () => {
    socketIO.emit("get-stranger-socket-id");
};
const express = require('express');
const http = require('http');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server)

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

let connectedUsers = [];
let connectedPeersStrangers = [];

io.on("connection", (socket) => {
    connectedUsers.push(socket.id);

    socket.on("pre-offer", (data) => {
        const { callType, calleePersonalCode } = data;
        const connectedPeer = connectedUsers.find((peerSocketId) => {
           return peerSocketId === calleePersonalCode;
        });
        if (connectedPeer) {
            const data = {
                callType,
                callerSocketId: socket.id,
            };
            io.to(calleePersonalCode).emit("pre-offer", data);
        } else {
            const data = {
                preOfferAnswer: "CALLEE_NOT_FOUND",
            }
            io.to(socket.id).emit("pre-offer-answer", data);
        }
    });

    socket.on("pre-offer-answer", (data) => {
        const connectedPeer = connectedUsers.find((peerSocketId) => {
            return peerSocketId === data.callerSocketId;
        });
        if (connectedPeer) {
            io.to(data.callerSocketId).emit("pre-offer-answer", data);
        } 
        console.log("pre-offer-answer came");
        console.log(data);
    });

    socket.on("webRTC-signalling", (data) => {
        const { connectedUserSocketId } = data;
        const connectedPeer = connectedUsers.find((peerSocketId) => {
            return peerSocketId === connectedUserSocketId;
        });

        console.log(connectedPeer);

        if (connectedPeer) {
            io.to(connectedUserSocketId).emit("webRTC-signalling", data);
        }
    });

    socket.on("user-hanged-up", (data) => {
        const { connectedUserSocketId } = data;
        const connectedPeer = connectedUsers.find((peerSocketId) => {
            return peerSocketId === connectedUserSocketId;
        });
        if (connectedPeer) {
            console.log("REACHED HERE");
            io.to(connectedUserSocketId).emit("user-hanged-up");
        }
    });

    socket.on("stranger-connection-status", (data) => {
        const { status } = data;
        if (status) {
            connectedPeersStrangers.push(socket.id);
        } else {
            const newConnectedPeersStrangers = connectedPeersStrangers.filter((peerSocketId) => {
                return peerSocketId !== socket.id;
            });
            connectedPeersStrangers = newConnectedPeersStrangers;
        }
        console.log(connectedPeersStrangers);
    })

    socket.on("get-stranger-socket-id", () => {
        let randomStrangerSocketId;
        const filteredConnectedPeersStrangers = connectedPeersStrangers.filter((peerSocketId) => {
            return peerSocketId !== socket.id;
        });

        if (filteredConnectedPeersStrangers.length > 0) {
            randomStrangerSocketId = filteredConnectedPeersStrangers[Math.floor(Math.random() * filteredConnectedPeersStrangers.length)];
        } else {
            randomStrangerSocketId = null;
        }

        const data = {
            randomStrangerSocketId,
        };

        io.to(socket.id).emit("stranger-socket-id", data);
    })

    socket.on('disconnect', () => {
        const newConnectedUsers = connectedUsers.filter((socketId) => {
            return socketId !== socket.id;
        });

        const newConnectedPeersStrangers = connectedPeersStrangers.filter((socketId) => {
            return socketId !== socket.id;
        });

        connectedUsers = newConnectedUsers;
        connectedPeersStrangers = newConnectedPeersStrangers;
    });
});

server.listen(PORT, () => console.log(`listening on ${PORT}`));

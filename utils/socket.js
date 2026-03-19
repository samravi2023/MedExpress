const { Server } = require("socket.io");

let ioInstance = null;

const initSocket = (server) => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(server, {
    cors: { origin: "*" }
  });

  ioInstance.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join_booking", (bookingId) => {
      if (bookingId) {
        socket.join(bookingId);
      }
    });

    socket.on("leave_booking", (bookingId) => {
      if (bookingId) {
        socket.leave(bookingId);
      }
    });

    socket.on("join_room", (bookingId) => {
      socket.join(bookingId);
    });

    socket.on("send_location", (data) => {
      // Data contains { bookingId, lat, lng }
      ioInstance.to(data.bookingId).emit("receive_location", data);
    });

    socket.on("disconnect", () => console.log("Disconnected"));
  });

  return ioInstance;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  }
  return ioInstance;
};

module.exports = { initSocket, getIO };
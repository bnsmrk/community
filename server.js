const io = require("socket.io")(3000, {
  cors: { origin: "*" },
});

const users = {};

console.log("Server started on http://localhost:3000");

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("join-room", (userData) => {
    users[socket.id] = {
      id: socket.id,
      ...userData,
    };
    console.log(`${userData.name} joined`);
    io.emit("update-players", users);
  });

  socket.on("move", (pos) => {
    if (users[socket.id]) {
      Object.assign(users[socket.id], pos);
      socket.broadcast.emit("player-moved", users[socket.id]);
    }
  });

  socket.on("send-chat", (message) => {
    const user = users[socket.id];
    if (user && message?.trim()) {
      console.log(`[CHAT] ${user.name}: ${message}`);
      io.emit("receive-chat", {
        id: socket.id,
        name: user.name,
        color: user.labelColor,
        message: message.trim(),
      });
    }
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      console.log(`${users[socket.id].name} disconnected`);
      delete users[socket.id];
      io.emit("player-disconnected", socket.id);
    }
  });
});

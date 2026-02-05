

let io = null;

export function setIO(serverIO) {
  io = serverIO;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

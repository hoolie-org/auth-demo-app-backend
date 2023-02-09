import {Server} from "socket.io";
import config from "../config";

const io = new Server(config.SOCKET_IO_HTTP.PORT);

export default io;

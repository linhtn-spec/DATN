import dotenv from "dotenv";
dotenv.config();
import Express from "express";
const serverSocket = http.createServer(app)

const socketIO = new Server(serverSocket, {
    cors: {
        origin: [process.env.WHITE_URL_1, process.env.WHITE_URL_2],
        credentials: true
    }
});

app.set('socketio', socketIO);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('views', __dirname + '\\views')
app.use(Express.static(join(__dirname, 'public')));

app.set('view engine', 'jade')
app.get('/', (req, res) => {
    res.render('index.pug')
})

mongoose.connect(process.env.URL_DB)
    .then(() => {
        console.log("Connected to the database");
    })
    .catch((err) => {
        console.error("Error connecting to the database:", err.message);
    });

serverSocket.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on port ${process.env.SERVER_PORT}`);
});




socketIO.on('connection', (socket) => {

    console.log(`⚡: ${socket.id} user just connected`);
    socket.on("setup", (userData) => {
        socket.join(userData);
        console.log('id ', userData);
        socket.emit("connected");
    });


    socket.on("join chat", (room) => socket.join(room)
    );

    socket.on("send message", (data) => {
        const { senderId, receiverId, content } = data;
        socket.to(receiverId).emit("receive message", { senderId, content });
    });

    socket.on("new message", (newMessageReceived) => {
        const roomId = newMessageReceived?.roomId?._id || newMessageReceived?.roomId;
        if (!roomId) return console.log("Room ID not defined");

        // Broadcast to the room (both customer and staff should be in this room)
        socket.to(roomId).emit("message recieved", newMessageReceived);
    });

    socket.off("setup", (userData) => {
        console.log("USER DISCONNECTED");
        socket.leave(userData);
    });
});


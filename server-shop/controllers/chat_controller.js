import chat_model from "../models/chat_model.js";

const getChatroomDetail = async (req, res) => {
    try {

        const roomId = req.params.roomId;
        const chatroom = await chat_model.findOne({ roomId: roomId }).populate(
            {
                path: "roomId",
                model: "User",
                select: "firstName lastName role"
            })
            .populate(
                {
                    path: "message.userId",
                    model: "User",
                    select: "firstName lastName role"
                }
            )
        if (!chatroom)
            return res.status(200).json({ roomId: roomId, message: [] });

        const sortedMessages = chatroom.message.sort((a, b) => b.day - a.day);

        return res.status(200).json({ ...chatroom.toObject(), message: sortedMessages });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



const getChatrooms = async (req, res) => {
    try {
        const rooms = await chat_model.find({}).populate(
            {
                path: "roomId",
                model: "User",
                select: "firstName lastName role"
            })
        if (rooms.length === 0)
            return res.status(404).json({ message: "Phòng chat không tồn tại" });

        return res.json(rooms);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const sendMessage = async (req, res) => {
    try {
        const { roomId, content } = req.body;
        const { _id, role } = req.user;
        const roomFind = role === 0 ? _id : roomId
        const room = await chat_model.findOne({ roomId: roomFind });

        if (room) {
            room.message.push({
                userId: _id,
                content: content,
            });
            await room.save();
        } else {
            // Optional: Create room if it doesn't exist
            const createdRoom = await chat_model.create({
                roomId: _id,
                message: {
                    sender: {
                        id: _id,
                        role: role,
                    },
                    content: content,
                },
            });
            const chatroom = await chat_model.findOne({ _id: createdRoom._id }).populate(
                {
                    path: "roomId",
                    model: "User",
                    select: "firstName lastName role"
                }).populate(
                    {
                        path: "message.userId",
                        model: "User",
                        select: "firstName lastName role"
                    }
                )

            return res.status(200).json(chatroom);

        }

        const updatedRoom = await chat_model.findOne({ roomId: roomFind }).populate(
            {
                path: "roomId",
                model: "User",
                select: "firstName lastName role"
            }).populate(
                {
                    path: "message.userId",
                    model: "User",
                    select: "firstName lastName role"
                }
            );
        return res.status(200).json(updatedRoom);
    } catch (error) {

        return res.status(500).json({ message: error.message });
    }
};




export { getChatroomDetail, getChatrooms, sendMessage };

/**
 * Chat-APP
 *
 * @author      Anees Muzzafer
 * @copyright   Anees Muzzafer
 *
 *
 */

let users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return { error: "Please insert a valid username and room" }
    }

    const existingUser = users.find(user => user.username === username && user.room === room);

    if (existingUser) {
        return { error: "This username is already taken for this room. Please use a different username!" }
    }

    const user = { id, username, room };
    users.push(user);
    return { user };
};


const removeUser = (id) => {

    const findUser = users.find(user => user.id === id);
    if (findUser) {
        const filteredUsers = users.filter(user => user.id !== id);
        users = filteredUsers;
        return findUser;
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id);
}

const getUsersInRoomString = (room) => {
    const usersInRoom = [];
    users.map(user => user.room === room && usersInRoom.push(user.username));
    return usersInRoom;
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getUsersInRoomString
};
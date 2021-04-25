class WebSockets {
    //makes an empty user array
    users = []
    //then it passes a socket to the connection func
    connection(client){
        client.on('disconnect', () => {
            //it filters out the person that left that disconnected
            this.users = this.users.filter((user) => user.socketId !== client.id)
        })
        //adds a client to the users array, client id is that persons socket id
        //userid is the actual mongodb id
        client.on('identity', (userId) => {
            this.users.push({
                socketId: client.id,
                userId: userId
            })
        })
        //adds person to the room
        client.on('subscribe', (room) => {
            client.join(room)
        })
    }
}

export default new WebSockets()
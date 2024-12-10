const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const port = 9000
const server = http.createServer(app)
const io = new Server(server)

const internetSockets = {}
const bossKey = "FALCONE"

app.use(express.static('public'))

io.on('connection', (socket) => {
    const {id} = socket

    if(!Object.keys(internetSockets).length){
        //non c'è nessuno: aggiungi prof
        internetSockets[bossKey] = socket
        handleInternetSocket(internetSockets[bossKey], true)
    }
    else{
        //c'è qualcuno
        if(!(bossKey in internetSockets)){
            //c'è qualcuno ma non il prof: aggiungilo
            internetSockets[bossKey] = socket
            handleInternetSocket(internetSockets[bossKey], true)
        }
        else{
            //c'è qualcuno, compreso il prof: aggiungi il client
            internetSockets[id] = socket
            handleInternetSocket(internetSockets[id], false)
        }
    }
})

server.listen(port, () => {
    console.log(`Server online porta ${port}`)

    setInterval(() => {
        console.log(Object.keys(internetSockets))
    }, 2000);
})

function handleInternetSocket(socket, isBoss){
    socket.on('', ()=>{
    })

    socket.on('disconnect', () => {
        if(internetSockets[bossKey]){
            if(socket.id === internetSockets[bossKey].id){
                delete internetSockets[bossKey]
            }else{
                delete internetSockets[socket.id]
            }
        }else{
            delete internetSockets[socket.id]
        }
    })

    if(isBoss){
        socket.emit('falcone-loading')
    }
    else{
        socket.emit('user-loading')
    }
}

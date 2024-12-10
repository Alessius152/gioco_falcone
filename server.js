/*
BUG: se spammo aggiorna pagina, alcuni 'disconnect' sembrano non essere gestiti
*/

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const port = 9000
const server = http.createServer(app)
const io = new Server(server)

const internetSockets = {}
const bossKey = "FALCONE"

let isRollingDice
let num

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
    }, 2000)
})

function handleInternetSocket(socket, isBoss){
    socket.on('an-user-wants-to-roll-dice', ()=>{
        if(isRollingDice){
            return
        }

        if(!internetSockets[bossKey]){
            for(const key in internetSockets){
                internetSockets[key].emit('falcone-is-offline')
            }

            return
        }

        isRollingDice = true

        num = Math.floor(Math.random() * 6) + 1
        console.log(num) //il prof vedrà da subito il numero ma gli altri aspettano l animazione

        internetSockets[bossKey].emit('dice-rolling-animation')
    })

    socket.on('dice-rolling-animation-is-finished', ()=>{
        if(!internetSockets[bossKey]){
            for(const key in internetSockets){
                internetSockets[key].emit('falcone-is-offline')
            }

            return
        }
        internetSockets[bossKey].emit('dice-has-been-rolled', {num})
        isRollingDice = false
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

const express= require('express');
var fs = require('fs')
const app=express()
const https = require('https')
const port=process.env.PORT || 3000
const secureServer = https.createServer({
    key: fs.readFileSync('./Keys/server.key'),
    cert: fs.readFileSync('./Keys/server.cert')
    }, app).listen(port,() => console.log("Active on "+port+" port"))

const io=require('socket.io')(secureServer)


app.use(express.static(__dirname+"/public"))

let clients = 0

io.on("connection", function(socket){
    socket.on("NewClient", function()
    {
        if (clients <2){
            if (clients ==1){
                this.emit('CreatePeer')
            }
        }
        else
            this.emit('SessionActive')
        
        clients++;

    })
    socket.on('Offer',SendOffer)
    socket.on('Answer',SendAnswer)
    socket.on('disconnect',Disconnect)

})

function Disconnect(){
    if (clients > 0){
        if (clients <= 2)
            this.broadcast.emit("Disconnect")
        clients--
    }
}

function SendOffer(offer)
{
    this.broadcast.emit("BackOffer",offer)
}
function SendAnswer(data)
{
    this.broadcast.emit("BackAnswer",data)
}





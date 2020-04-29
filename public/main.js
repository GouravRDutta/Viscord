
  let Peer = require('simple-peer')
  let socket =io()
  const video=document.querySelector('video')
  let client={}
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream =>
  {
    
     
     socket.emit('NewClient')
     video.srcObject=stream
     video.play()

     function InitPeer(type)
     {
      let peer = new Peer({ initiator: (type== 'init')?true:false,stream: stream,trickle: false})
      peer.on('stream',function(stream) {
        createVideo(stream)
        console.log(2) 
      })
      
      return peer
      
     }

     //For peer of type init
     function MakePeer(){
     client.gotAnswer=false

     let peer=InitPeer('init')
     peer.on('signal', function(data) {
      if (!client.gotAnswer){
        socket.emit('Offer',data)
      } 
     })
     client.peer=peer
     }
    //for peer other than init
    function FrontAnswer(offer){
      let peer=InitPeer('notInit')
      peer.on('signal', function(data) {
        socket.emit('Answer',data)
     })
     peer.signal(offer)
     client.peer = peer
    }




   function signalAnswer(answer){
   client.gotAnswer=true
   let peer = client.peer
   peer.signal(answer)
   }


   function createVideo(stream){

      let video=document.createElement('video')
      video.id='peerVideo'
      video.srcObject=stream
      video.setAttribute('class', 'embed-responsive-item')
      document.querySelector('#peerDiv').appendChild(video)
      video.play()
      
     let button=document.createElement('button')
      button.innerHTML="Disconnect"
      button.setAttribute('class','btn btn-info')
      button.id="peerButton"
      button.onclick=function() { 
        console.log("disconnected")
        socket.emit('disconnectfrmbtn')
        window.close()
   }
     document.getElementById('peerDiv').appendChild(button)
      
   }
   
  document.getElementById('send').addEventListener('click',function()
{
  let yourMessage=document.getElementById('yourMessage').value
  socket.emit('datafrmclient',yourMessage)
  document.getElementById('yourMessage').value="";
}
  )
    
   function RemovePeer() {
    document.getElementById("peerVideo").remove();
    document.getElementById("peerButton").remove();
    if (client.peer) {
        client.peer.destroy()
    }
  }
   function SessionActive(){
     document.write("Session Active ... Come Back Later")
   }

  socket.on('BackOffer',FrontAnswer)
  socket.on('BackAnswer',signalAnswer)
  socket.on('CreatePeer',MakePeer)
  socket.on('SessionActive',SessionActive)
  socket.on('removepeer',RemovePeer)
  socket.on('datafrmserver',function(data){
    alert(data)
    document.getElementById('messages').textContent +=data+'\n'  
  })
 
}).catch(err=> document.write(err))


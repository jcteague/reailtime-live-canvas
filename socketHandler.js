/**
 * Created by jcteague on 8/7/15.
 */
'use strict';
module.exports = function(io){
  console.log("handling socket io events");
  io.on('connection',function(socket){
      console.log("socket.io connection made");

      socket.on('new:rect', function(data) {
        console.log("element created: ");
        socket.broadcast.emit ('new:rect', data);
      });
    ['item:scaled','item:moved','item:rotated','item:selected','item:selectionCleared'].forEach(function(evnt){
      socket.on(evnt,function(data){
        console.log("recieved " + evnt + " message");
        socket.broadcast.emit(evnt,data);
      })
    })

  });
}

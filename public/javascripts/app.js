/**
 * Created by jcteague on 8/7/15.
 */
'use strict';
var objects = [];
var socket = io();
$(function(){
  var cnvs1 = new fabric.Canvas("cnvs");

  $('#square').click(function(){
    var rect = new fabric.Rect({
      left:10, top:10, fill:'red', width:50, height:50
    });
    var id = generateId();
    rect.id = id;
    objects.push(rect);
    var data = {rect:rect.toJSON(),id:id};
    socket.emit("new:rect", data);
    cnvs1.add(rect);

  });
  socket.on('new:rect',function(data){
    console.log('received new rect');
    console.log(data)
    var rect = new fabric.Rect(data.rect);
    rect.id = data.id;
    objects.push(rect);
    cnvs1.add(rect);
  });
  socket.on('item:selected',function(data){
    objects.forEach(function(i){
      if(i.id === data.id){
        i.set('selectable',false)
      }
    })
  });
  socket.on('item:selectionCleared',function(data){
    objects.forEach(function(i){
      if(i.id === data.id){
        i.set('selectable',true)
      }
    })
  });
  canvasEvents.forEach(function(evnt){
    cnvs1.on(evnt.event,evnt.canvasHandler)
  });
  cnvs1.on( "object:selected", function(e,d) {
    console.log("canvas object selected: %d, %o", e.target.id, e.target);
    socket.emit( "item:selected",{id:e.target.id});
  });
  cnvs1.on("before:selection:cleared",function(e,f){
    console.log("canvas selection cleared: %d, %o");
    socket.emit( "item:selectionCleared" ,{id: e.target.id});
  });

  var cnvsEvents =   ['item:scaled','item:moved','item:rotated'];
  cnvsEvents.forEach(function(evnt){
      socket.on(evnt,function(data){
        console.log("message recieved: " + evnt);
        objects.forEach(function(i){
          if(i.id === data.id){
            i.setOptions(data.options);
            cnvs1.renderAll()
          }
        })

      })

  });


});
var canvasEvents = [
  {
    event: 'object:moving',
    canvasHandler: function(e){
      var newPosition =  {id:e.target.id, options:{left: e.target.left,top:e.target.top}};
      console.log ("object moving: %o", {id: e.target.id, options:{left: e.target.left,top:e.target.top}});
      socket.emit("item:moved", newPosition)
    }
  },
  {
    event: 'object:scaling',
    canvasHandler: function(e){
      console.log( "object scaling: %o", e);
      socket.emit("item:scaled",{id: e.target.id, options:{scaleX: e.target.scaleX, scaleY: e.target.scaleY}});

    }
  },
  {
    event :'object:rotating',
    canvasHandler:function(e){
      console.log( "object rotating: %o", e);
      socket.emit("item:rotated",{id: e.target.id, options:{angle:e.target.angle}});
    }
  }
];
var createRect = function(){
  var rect = new fabric.Rect({
    left:10, top:10, fill:'red', width:50, height:50
  });
  rect.id = generateId();

  return rect;
}

var generateId = function(){
  var alpha = '0123456789abcdef';
  var id = '';
  for(var i =0 ; i <6; i++){
    var r = Math.random() * 16 | 0;
    id = id+alpha[r];
  }
  return id;
}

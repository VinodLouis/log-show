module.exports = function(file,lastNBytes,cb){
    var fd, size, called
    var orig = cb
    
    var start = function fn(err,data){
      if(steps.length && !err) {
        return steps.shift(start)
      }
      
      if(called) return;
      called = 1
      console.log(data,steps.length)
      orig(err,data)
      if(fd) fs.close(fd,function(){})
    }
    
    var steps = [
      // first open the file
      function(next){
        fs.open(file,'r',function(err,_fd){
          if(err) return cb(err)
          fd = _fd
          next()
        })
      },
      // then stat the file to get the size
      function(next){
        fs.stat(file,function(err,stat){
          if(err) return cb(err)
          size = stat.size
          next()
        })
      },
      // read the file offset you want and close the file
      function (next){
        fs.read(fd, new Buffer(lastNBytes), size-lastNBytes, lastNBytes, 0, function(err,bytesRead,data){
          if(err) return next(err)
          next(false,data.slice(0,bytesRead))
        })
      }
    ]
    
    start();
  }
const http = require('http');
const fs = require("fs");
const path = require("path");
var socket = require("socket.io");
var lastThrreLine = [];
function send404(response){
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: Resource not found.');
  response.end();
}

function updateFileContent(isFileChanged){
    let fileContent = fs.readFileSync('file.log','utf8');
    let allLines = fileContent.split("\n");
    if(isFileChanged){
        io.emit('data', {content:allLines.slice(allLines.indexOf(lastThrreLine[lastThrreLine.length-1])+1).join("\n")}); // short form   
    }
    lastThrreLine = (allLines.length > 3) ? allLines.slice(allLines.length-3) : allLines;
}


const mimeLookup = {
  '.html': 'text/html',
  '.js': 'application/javascript',
};


fs.watchFile('file.log', (curr, prev) => {
    updateFileContent(true);
});


const server = http.createServer((req, res) => {
  if(req.method == 'GET'){

    let fileurl;
    if(req.url == '/'){
      fileurl = 'index.html';
    }else{
      fileurl = req.url;
    }
    let filepath = path.resolve('./' + fileurl);

    let fileExt = path.extname(filepath);
    let mimeType = mimeLookup[fileExt];

    if(!mimeType) {
      send404(res);
      return;
    }

    fs.exists(filepath, (exists) => {
      if(!exists){
        send404(res);
        return;
      }

      res.writeHead(200, {'Content-Type': mimeType});
      fs.createReadStream(filepath).pipe(res);

    });
  }
});

var io  = socket.listen(server.listen(3000))
console.log("Server running at port 3000");
updateFileContent(false);

io.sockets.on("connection",(socket)=>{
    console.log("connection received");
    socket.emit("data",{content:lastThrreLine.join("\n")});
})
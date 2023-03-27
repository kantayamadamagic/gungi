var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var url = require('url');
var path = require('path');

var port_num = 7000;

var load_static_file = function (uri, response) {
    var tmp = uri.split('.');
    var type = tmp[tmp.length - 1];
    var filename = path.join(process.cwd(), uri);

    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.write('404 Not Found\n');
            response.end();
            return;
        }

        fs.readFile(filename, 'binary', function (err, file) {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.write(err + '\n');
                response.end();
                return;
            }

            switch (type) {
                case 'html':
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    break;
                case 'js':
                    response.writeHead(200, { 'Content-Type': 'text/javascript' });
                    break;
                case 'css':
                    response.writeHead(200, { 'Content-Type': 'text/css' });
                    break;
                case 'png':
                    response.writeHead(200, { 'Content-Type': 'image/png' });
                    break;
            }
            response.write(file, 'binary');
            response.end();
        });
    });
};

var server = http.createServer(
    function (req, res) {
        var uri = url.parse(req.url).pathname;
        load_static_file(uri, res);
    }
).listen(port_num);

var io = socketio(server);
const HYO = 1; //兵
const YAR = 2; //槍
const KIB = 3; //馬
const SIN = 4; //忍
const SAM = 5; //侍
const TOR = 6; //砦
const SHO = 7; //小将
const TYU = 8; //中将
const TAI = 9; //大将
const SUI = 10; //師

// 初期配置(軍議)
var board_data_1p = [
  [[0,0],[0,0],[0,0],[-TYU,0],[-SUI,0],[-TAI,0],[0,0],[0,0],[0,0]],
  [[0,0],[-KIB,0],[0,0],[0,0],[-YAR,0],[0,0],[0,0],[-SIN,0],[0,0]],
  [[-HYO,0],[0,0],[-TOR,0],[-SAM,0],[-HYO,0],[-SAM,0],[-TOR,0],[0,0],[-HYO,0]],
  [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
  [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
  [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
  [[HYO,0],[0,0],[TOR,0],[SAM,0],[HYO,0],[SAM,0],[TOR,0],[0,0],[HYO,0]],
  [[0,0],[SIN,0],[0,0],[0,0],[YAR,0],[0,0],[0,0],[KIB,0],[0,0]],
  [[0,0],[0,0],[0,0],[TAI,0],[SUI,0],[TYU,0],[0,0],[0,0],[0,0]],
];
var board_data_2p = [
    [[0,0],[0,0],[0,0],[-TYU,0],[-SUI,0],[-TAI,0],[0,0],[0,0],[0,0]],
    [[0,0],[-KIB,0],[0,0],[0,0],[-YAR,0],[0,0],[0,0],[-SIN,0],[0,0]],
    [[-HYO,0],[0,0],[-TOR,0],[-SAM,0],[-HYO,0],[-SAM,0],[-TOR,0],[0,0],[-HYO,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
    [[HYO,0],[0,0],[TOR,0],[SAM,0],[HYO,0],[SAM,0],[TOR,0],[0,0],[HYO,0]],
    [[0,0],[SIN,0],[0,0],[0,0],[YAR,0],[0,0],[0,0],[KIB,0],[0,0]],
    [[0,0],[0,0],[0,0],[TAI,0],[SUI,0],[TYU,0],[0,0],[0,0],[0,0]],
  ];
for(let i=0;i<9;i++){
    for(let j=0;j<9;j++){
        board_data_2p[i][j]=board_data_1p[8-i][8-j];
    }
}
var player_num=0;
var id1,id2;
// S04. connectionイベントを受信する
var gungi=io.of('/gungi').on('connection',function(socket){
    if(player_num==0){
        player_num+=1;
        id1=socket.id;
        gungi.to(id1).emit("your_player_num",1);
        console.log(player_num,id1);
    }
    else if(player_num==1){
        player_num+=1;
        id2=socket.id;
        gungi.to(id2).emit("your_player_num",-1);
        console.log(player_num,id2);
    }
    if(player_num==2){
        gungi.to(id2).emit("server_board",board_data_2p);
        gungi.to(id1).emit("yourturn_start");
        console.log("game start")
    }
    socket.on('client_board',function(data){
        if(socket.id==id1){
            board_data_1p=data;
            for(let i=0;i<9;i++){
                for(let j=0;j<9;j++){
                    board_data_2p[i][j]=data[8-i][8-j];
                }
            }
        }
        else if(socket.id==id2){
            board_data_2p=data;
            for(let i=0;i<9;i++){
                for(let j=0;j<9;j++){
                    board_data_1p[i][j]=data[8-i][8-j];
                }
            }
        }
        gungi.to(id1).emit('server_board',board_data_1p);
        gungi.to(id2).emit('server_board',board_data_2p);
    })
    socket.on("myturn_end",function(){
        if(socket.id==id1){
            gungi.to(id2).emit("yourturn_start");
        }
        else if(socket.id==id2){
            gungi.to(id1).emit("yourturn_start");
        }
    })
    socket.on("I_win",function(){
        if(socket.id==id1){
            gungi.to(id2).emit("you_lose");
        }
        else if(socket.id==id2){
            gungi.to(id1).emit("you_lose");
        }
        gungi.emit("game_over");
    })
})
// const { lookupService } = require("dns");

// 2023/01/27更新
let col; 
let row; 

let img = [];
var gungi=io("http://localhost:7000/gungi");
//var gungi=io('https://30d3-133-10-250-1.jp.ngrok.io/gungi');
let player_num;
//軍議の駒
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
var board_data = [
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


//セルの大きさ
const CELL_SIZE = 50;

const BOARD_COLUMN = 9;

//自分のターンかどうか
var my_turn = false;

//選択したコマの種類
//number,col, row, high
var selected_piece = [0,0,0,0]
var selected_piece_number = 0;
var selected_piece_col = 0;
var selected_piece_row = 0;
var selected_piece_high = 0

//行き先の列と行を保存
var destinate_row = 0;
var destinate_col = 0;

//駒選択状態か 0:何も選択してない 1:盤面上の駒を選択状態
var piece_select_status = 0;

//次の一手をツケるかどうか
var tuke_flag = 0;

//駒の明るさの状態
var piece_brightness = 0
var a

var reverse_flag = false

//自分の持ち駒
var my_piece = [];

//敵の持ち駒
var enemy_piece = [];

function preload(){
  img[0] = loadImage("koma_black/hei.png") 
  img[1] = loadImage("koma_black/yari.png")
  img[2] = loadImage("koma_black/uma.png") 
  img[3] = loadImage("koma_black/sinobi.png")
  img[4] = loadImage("koma_black/samurai.png") 
  img[5] = loadImage("koma_black/toride.png")
  img[6] = loadImage("koma_black/shosho.png")
  img[7] = loadImage("koma_black/chusho.png")
  img[8] = loadImage("koma_black/taisho.png")
  img[9] = loadImage("koma_black/si.png")
  img[10] = loadImage("koma_white/hei_white.png") 
  img[11] = loadImage("koma_white/yari_white.png")
  img[12] = loadImage("koma_white/uma_white.png") 
  img[13] = loadImage("koma_white/sinobi_white.png")
  img[14] = loadImage("koma_white/samurai_white.png") 
  img[15] = loadImage("koma_white/toride_white.png")
  img[16] = loadImage("koma_white/shosho_white.png")
  img[17] = loadImage("koma_white/chusho_white.png")
  img[18] = loadImage("koma_white/taisho_white.png")
  img[19] = loadImage("koma_white/si_white.png")
}

function setup() {

  createCanvas(CELL_SIZE*9, CELL_SIZE*9);
  // button = createButton('ターン変更');
  // button.mousePressed(change_turn);
  button = createButton('ツケる');
  button.mousePressed(tuke_true);
  button = createButton('ツケない');
  button.mousePressed(tuke_false);
}

function draw() {
  background(249,194,112);
  fill(0,189,100);
  //盤を描画
  for(let i = 0; i < 9; i++){
    line(0, i * CELL_SIZE, width, i * CELL_SIZE);
  }
  for(let j = 0; j < 9; j++){
    line(j*CELL_SIZE, 0, j * CELL_SIZE, height);
  }
  //駒を描画
  for(let i = 0; i < 9; i++){
    for(let j = 0; j < 9; j++){
      //一段目のみ描画
      if(board_data[i][j][0] != 0 && board_data[i][j][1] == 0){
        // 奥側
        if (player_num * board_data[i][j][0] < 0){
          push();
          translate(j*CELL_SIZE+(CELL_SIZE/2),i*CELL_SIZE+(CELL_SIZE/2));
          imageMode(CENTER);
          rotate(radians(180));
          if(player_num == 1){
            piece = -board_data[i][j][0]+9
          }
          else{
            piece = board_data[i][j][0]-1
          }
          image(img[piece], 0, 0, CELL_SIZE, CELL_SIZE);
          pop();
        }
        // 手前側
        else{
          if(player_num == 1){
            piece = board_data[i][j][0]-1
          }
          else{
            piece = -board_data[i][j][0]+9
          }
          image(img[piece], j*CELL_SIZE, i*CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
      //二段目も含む描画
      if(board_data[i][j][1] != 0){
        //一段目
        //奥側
        if (player_num * board_data[i][j][0] < 0){
          push();
          translate(j*CELL_SIZE+(CELL_SIZE/2)+15,i*CELL_SIZE+(CELL_SIZE/2)+15);
          imageMode(CENTER);
          rotate(radians(180));
          if(player_num == 1){
            piece = -board_data[i][j][0]+9
          }
          else{
            piece = board_data[i][j][0]-1
          }
          image(img[piece], 0, 0, CELL_SIZE-20, CELL_SIZE-20);
          pop();
        }
        //手前側
        else{
          if(player_num == 1){
            piece = board_data[i][j][0]-1
          }
          else{
            piece = -board_data[i][j][0]+9
          }
          image(img[piece], j*CELL_SIZE+(CELL_SIZE/2), i*CELL_SIZE+(CELL_SIZE/2), CELL_SIZE-20, CELL_SIZE-20);
        }
        //二段目
        // 奥側
        if (player_num * board_data[i][j][1] < 0){
          push();
          translate(j*CELL_SIZE+(CELL_SIZE/2-5),i*CELL_SIZE+(CELL_SIZE/2-5));
          imageMode(CENTER);
          rotate(radians(180));
          if(player_num == 1){
            piece = -board_data[i][j][1]+9
          }
          else{
            piece = board_data[i][j][1]-1
          }
          image(img[piece], 0, 0, CELL_SIZE-10, CELL_SIZE-10);
          pop();
        }
        // 手前側
        else{
          if(player_num == 1){
            piece = board_data[i][j][1]-1
          }
          else{
            piece = -board_data[i][j][1]+9
          }
          image(img[piece], j*CELL_SIZE, i*CELL_SIZE, CELL_SIZE-10, CELL_SIZE-10);
        }
      }
    }
  }

  push();
  strokeWeight(5);
  line(0,0,CELL_SIZE*9,0);
  line(0,0,0,CELL_SIZE*9);
  line(0,CELL_SIZE*9,CELL_SIZE*9,CELL_SIZE*9);
  line(CELL_SIZE*9,0,CELL_SIZE*9,CELL_SIZE*9);
  pop();

  //カーソル位置の駒がどこに移動できるか
  row = floor(mouseY / CELL_SIZE);
  col = floor((mouseX) / CELL_SIZE);
  if(row < 9 && row >=0 && col < 9 && col >= 0){
    if(player_num * board_data[row][col][1] > 0 || (board_data[row][col][1] == 0 && player_num * board_data[row][col][0] > 0)){
      //自駒の位置を点滅させる
      fill(0, 0, 0, piece_brightness);
      high = 0
      if(board_data[row][col][1] != 0){
        high = 1
      }
      for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
          if(can_move(j, i, row, col, high, board_data[row][col][high], player_num)){
            rect(i*CELL_SIZE,j*CELL_SIZE,CELL_SIZE,CELL_SIZE)
          }
        }
      }
      if(piece_brightness > 160){
        a = -1
      }
      else if(piece_brightness < 50){
        a = 1
      }
      piece_brightness = a*3 + piece_brightness
    }
  }
}

//クリックがあった時の動作
function mousePressed() {
  console.log(player_num)
  // クリックした時のマウス座標をマスの長さで割って切り捨てると何マス目かがわかる
  row = floor(mouseY / CELL_SIZE);
  col = floor((mouseX) / CELL_SIZE);
  console.log('列:' + str(row) + ', 行:' + str(col));
  //自分のターンかどうか
  if(my_turn){
    //クリックが盤面上か
    if(mouseX > 0 && mouseX < CELL_SIZE*BOARD_COLUMN && mouseY > 0 && mouseY < CELL_SIZE*BOARD_COLUMN){
      //駒選択中
      if(piece_select_status == 1){
        //移動できるか
        if(can_move(row, col, selected_piece_row, selected_piece_col, selected_piece_high, selected_piece_number, player_num)){
          //移動先が二段
          if(board_data[row][col][1] != 0){
            //二段目が敵駒
            if(player_num*board_data[row][col][1] < 0){
              //自駒も二段目
              if(selected_piece_high == 1){
                console.log('駒を移動します');
                if(board_data[row][col][0] == -10*player_num){
                  take_king();
                }
                board_data[row][col][1] = selected_piece_number;
                board_data[selected_piece_row][selected_piece_col][1] = 0;
                board_commu();
                change_turn();
              }
              else{
                console.log('駒の高さが足りません');
              }
            }
            //二段目が自駒(選択を変更)
            else{
              selected_piece_high = 1;
              selected_piece_number = board_data[row][col][1];
              selected_piece_row = row;
              selected_piece_col = col;
              piece_select_status = 1;
              console.log(str(selected_piece_number) + 'を選択中');
            }
          }
          //移動先が一段
          else{
            //一段目が敵駒
            if(player_num*board_data[row][col][0] < 0){
              console.log('駒を移動します');
              if(board_data[row][col][0] == -10*player_num){
                take_king();
              }
              //tuke_flagで移動先を指定
              board_data[row][col][tuke_flag] = selected_piece_number;    
              board_data[selected_piece_row][selected_piece_col][selected_piece_high] = 0;
              board_commu()
              change_turn();
            }
            //一段目が味方駒
            else if(player_num * board_data[row][col][0] > 0){
              //自駒にツケる
              if(tuke_flag == 1){
                console.log('駒を移動します');
                //tuke_flagで移動先を指定
                board_data[row][col][tuke_flag] = selected_piece_number;    
                board_data[selected_piece_row][selected_piece_col][selected_piece_high] = 0;
                board_commu();
                change_turn();
              }
              //選択駒を変更
              else{
                selected_piece_high = 0;
                selected_piece_number = board_data[row][col][0];
                selected_piece_row = row;
                selected_piece_col = col;
                piece_select_status = 1;
                console.log(str(selected_piece_number) + 'を選択中');
              }
            }
            else{
              console.log('空のマスに駒を移動します')
              board_data[row][col][0] = selected_piece_number;    
              board_data[selected_piece_row][selected_piece_col][selected_piece_high] = 0;
              board_commu();
              change_turn();
            }
          }
        }
        else{
          console.log('移動できません')
        }
      }
      else{
        //二段目の駒を選択
        if(player_num * board_data[row][col][1] > 0){
          selected_piece_high = 1;
          selected_piece_number = board_data[row][col][1];
          selected_piece_row = row;
          selected_piece_col = col;
          piece_select_status = 1;
          console.log(str(selected_piece_number) + 'を選択中');
        }
        else if(board_data[row][col][1] == 0){
          if(player_num * board_data[row][col][0] > 0){
            selected_piece_high = 0;
            selected_piece_number = board_data[row][col][0];
            selected_piece_row = row;
            selected_piece_col = col;
            piece_select_status = 1;
            console.log(str(selected_piece_number) + 'を選択中');
          }
        }
      }
    }
  }
  else{
    console.log('自分のターンではないです')
  }
}

//選択された駒が移動できる場所か判定
function can_move(row, col, base_row, base_col, base_high, base_number, player_num){
  var move = 0;
  var diff_row = base_row - row;
  var diff_col = base_col - col;
  base_number = base_number * player_num
  //移動先が二段で自分が一段だと移動できない
  if(base_high == 0 && board_data[row][col][1] != 0){
    return move;
  }
  if(board_data[row][col][1] > 0){
    return move;
  }
  //兵が移動できるかどうか
  if(base_number == 1){
    if(base_high == 0){
      if(diff_row == 1 && diff_col == 0){
        move = 1;
      }
    }
    //ツケてある兵が移動できるか
    else{
      if((diff_row == 1 || diff_row == 2) && diff_col == 0){
        //2マス移動するときは一個先に駒が存在するか確認
        if(!(diff_row == 2 && board_data[base_row-1][base_col][0] != 0)){
          move = 1;
        }
      }
    }
  }
  //槍が移動できるか
  else if(base_number == 2){
    if(base_high == 0){
      if((diff_row == 1 && abs(diff_col) <= 1) || (diff_row == -1 && diff_col == 0) || (diff_row == 2 && diff_col == 0)){
        if(!(diff_row == 2 && board_data[base_row-1][base_col][0] != 0)){
          move = 1;
        }
      }
    }
    //ツケの処理
    else{
      if((diff_col == 0 && diff_row <= 3 && diff_row >= -2 && diff_row != 0) || (diff_row > 0 && diff_row <= 2 && diff_row == abs(diff_col))){
        move = 1;
      }
    }
    //途中に駒があるか
    //前の移動
    if(diff_col == 0 && diff_row > 0 && diff_row <= 3){
      for(let i=0;i<diff_row-1;i++){
        if(board_data[base_row-i-1][base_col][0] != 0){
          move = 0;
        }
      }
    }
    //後ろの移動
    else if(diff_col == 0 && diff_row < 0){
      for(let i=0;i<abs(diff_row)-1;i++){
        if(board_data[base_row+i+1][base_col][0] != 0){
          move = 0;
        }
      }
    }
    //斜めの移動
    else if(diff_row > 0 && diff_row <= 2 && diff_row == abs(diff_col)){
      var a = 1;
      if(diff_col < 0){
        a = -1
      }
      for(let i=1;i<diff_row;i++){
        if(board_data[base_row-i][base_col-i*a][0] != 0){
          move = 0;
        }
      }
    }
  }
  //馬の移動
  else if(base_number == 3){
    if(base_high == 0){
      if((diff_col == 0 && abs(diff_row) <= 2 && diff_row != 0) || (diff_row == 0 && abs(diff_col) == 1)){
        move = 1;
      }
    }
    //ツケの処理
    else{
      if((diff_col == 0 && abs(diff_row) <= 3 && diff_row != 0) || (diff_row == 0 && abs(diff_col) <= 2 && diff_col != 0)){
        move = 1;
      }
    }
    //途中に駒があるか
    //前後の処理
    if(diff_col == 0 && abs(diff_row) <= 3 && diff_row != 0){
      var a = 1;
      if(diff_row < 0){
        a = -1
      }
      for(let i=1;i<abs(diff_row);i++){
        if(board_data[base_row-i*a][base_col][0] != 0){
          move = 0;
        }
      }
    }
    //左右の処理
    else if(diff_row == 0 && abs(diff_col) <= 2 && diff_col != 0){
      var a = 1;
      if(diff_col < 0){
        a = -1
      }
      for(let i=1;i<abs(diff_col);i++){
        if(board_data[base_row][base_col-i*a][0] != 0){
          move = 0
        }
      }
    }
  }
  //忍の移動
  else if(base_number == 4){
    if(base_high == 0){
      if(abs(diff_col) == abs(diff_row) && abs(diff_row) <= 2 && diff_col != 0){
        move = 1;
      }
    }
    //ツケの処理
    else{
      if(abs(diff_col) == abs(diff_row) && abs(diff_row) <= 3 && diff_col != 0){
        move = 1;
      }
    }
    //途中に駒があるか
    if(abs(diff_col) == abs(diff_row) && abs(diff_row) <= 3 && diff_col != 0){
      var a = 1;
      var b = 1;
      if(diff_row < 0){
        a = -1
      }
      if(diff_col < 0){
        b = -1
      }
      for(let i=1;i<abs(diff_row);i++){
        if(board_data[base_row-i*a][base_col-i*b][0] != 0){
          move = 0;
        }
      }
    }
  }
  //侍の処理
  else if(base_number == 5){
    if(base_high == 0){
      if((diff_row == 1 && abs(diff_col) <= 1) || (diff_row == -1 && diff_col == 0)){
        move = 1;
      }
    }
    else{
      if((abs(diff_row) <= 2 && diff_col == 0 && diff_row != 0) || (abs(diff_col) <= 2 && abs(diff_col) == diff_row && diff_row != 0)){
        move = 1;
      }
    }
    //途中に駒があるか
    if((abs(diff_row) <= 2 && diff_col == 0 && diff_row != 0) || (abs(diff_col) <= 2 && abs(diff_col) == diff_row && diff_row != 0)){
      //前後の処理
      if(diff_col == 0){
        var a = 1;
        if(diff_row < 0){
          a = -1;
        }
        for(let i=1;i<abs(diff_row);i++){
          if(board_data[base_row-i*a][base_col][0] != 0){
            move = 0;
          }
        }
      }
      //斜めの処理
      else{
        var a = 1;
        if(diff_col < 0){
          a = -1;
        }
        for(let i=1;i<abs(diff_col);i++){
          if(board_data[base_row-i][base_col-i*a][0] != 0){
            move = 0;
          }
        }
      }
    }
  }
  //砦の処理
  else if(base_number == 6){
    if(base_high == 0){
      if((diff_row > 0 && diff_row <= 1 && diff_col == 0) || (diff_row == 0 && abs(diff_col) <= 1 && diff_col != 0) || (abs(diff_col) == -diff_row && abs(diff_col) <= 1 && diff_col != 0)){
        move = 1;
      }
    }
    //ツケの処理
    else{
      if((diff_row > 0 && diff_row <= 2 && diff_col == 0) || (diff_row == 0 && abs(diff_col) <= 2 && diff_col != 0) || (abs(diff_col) == -diff_row && abs(diff_col) <= 2 && diff_col != 0)){
        move = 1;
      }
    }
    //途中に駒があるか
    if((diff_row > 0 && diff_row <= 2 && diff_col == 0) || (diff_row == 0 && abs(diff_col) <= 2 && diff_col != 0) || (abs(diff_col) == -diff_row && abs(diff_col) <= 2 && diff_col != 0)){
      //縦の処理
      var a = 1;
      if(diff_col < 0){
        a = -1;
      }
      if(diff_row == 2 && board_data[base_row-1][base_col][0] != 0){
        move = 0;
      }
      //横の処理
      else if(diff_row == 0){
        for(let i=1;i<abs(diff_col);i++){
          if(board_data[base_row][base_col-i*a][0] != 0){
            move = 0;
          }
        }
      }
      //斜めの移動
      else if(abs(diff_col) == -diff_row){
        for(let i=1;i<abs(diff_col);i++){
          if(board_data[base_row+i][base_col-i*a][0] != 0){
            move = 0;
          }
        }
      }
    }
  }
  //小将の処理
  else if(base_number == 7){
    if(base_high == 0){
      if((abs(diff_row) <= 1 && diff_row != 0 && diff_col == 0) || (abs(diff_col) <= 1 && diff_col != 0 && diff_row ==0) || (abs(diff_col) <= 1 && abs(diff_col) == diff_row && diff_row != 0)){
        move = 1;
      }
    }
    else{
      if((abs(diff_row) <= 2 && diff_row != 0 && diff_col == 0) || (abs(diff_col) <= 2 && diff_col != 0 && diff_row ==0) || (abs(diff_col) <= 2 && abs(diff_col) == diff_row && diff_row != 0)){
        move = 1;
      }
    }
    //途中に駒があるか
    if((abs(diff_row) <= 2 && diff_row != 0 && diff_col == 0) || (abs(diff_col) <= 2 && diff_col != 0 && diff_row ==0) || (abs(diff_col) <= 2 && abs(diff_col) == diff_row && diff_row != 0)){
      //前後の処理
      var a = 1;
      var b = 1;
      if(diff_row < 0){
        a = -1;
      }
      if(diff_col < 0){
        b = -1;
      }

      if(diff_col == 0){
        for(let i=1;i<abs(diff_row);i++){
          if(board_data[base_row-i*a][base_col][0] != 0){
            move = 0;
          }
        }
      }
      //左右の処理
      else if(diff_row == 0){
        for(let i=1;i<abs(diff_col);i++){
          if(board_data[base_row][base_col-i*b][0] != 0){
            move = 0;
          }
        }
      }
      //斜めの処理
      else{
        for(let i=1;i<abs(diff_col);i++){
          if(board_data[base_row-i][base_col-i*b][0] != 0){
            move = 0;
          }
        } 
      }
    }
  }
  //中将の処理
  else if(base_number == 8){
    if(base_high == 0){
      if((abs(diff_col) <= 1 && abs(diff_row) <= 1 && !(diff_col == 0 && diff_row == 0)) || (abs(diff_col) == abs(diff_row) && !(diff_col == 0 && diff_row == 0))){
        move = 1;
      }
    }
    else{
      if((abs(diff_row) <= 2 && diff_col == 0 && diff_row != 0) || (abs(diff_col) <= 2 && diff_row == 0 && diff_col != 0) || (abs(diff_col) == abs(diff_row) && !(diff_col == 0 && diff_row == 0))){
        move = 1;
      }  
    }
    //途中に駒があるか
    if((abs(diff_row) <= 2 && diff_col == 0 && diff_row != 0) || (abs(diff_col) <= 2 && diff_row == 0 && diff_col != 0) || (abs(diff_col) == abs(diff_row) && !(diff_col == 0 && diff_row == 0))){
      var a = 1;
      var b = 1;
      if(diff_row < 0){
        a = -1;
      }
      if(diff_col < 0){
        b = -1;
      }
      //前後の処理
      if(diff_col == 0){
        for(let i=1;i<abs(diff_row);i++){
          if(board_data[base_row-i*a][base_col][0] != 0){
            move = 0;
          }
        }
      }
      //左右の処理
      else if(diff_row == 0){
        for(let i=1;i<abs(diff_col);i++){
          if(board_data[base_row][base_col-i*b][0] != 0){
            move = 0;
          }
        }
      }
      //斜めの処理
      else{
        for(let i=1;i<abs(diff_row);i++){
          if(board_data[base_row-i*a][base_col-i*b][0] != 0){
            move = 0;
          }
        }
      }
    }  
  }
  //大将の処理
  else if(base_number == 9){
    if(base_high == 0){
      if((abs(diff_col) <= 1 && abs(diff_row) <= 1 && !(diff_col == 0 && diff_row == 0)) || (diff_col == 0 && diff_row != 0) || (diff_col != 0 && diff_row == 0)){
        move = 1;
      }
    }
    else{
      if((abs(diff_row) == abs(diff_col) && abs(diff_row) <= 2 && diff_row != 0) || (diff_col == 0 && diff_row != 0) || (diff_col != 0 && diff_row == 0)){
        move = 1;
      }
    }
    //途中に駒があるか
    if((abs(diff_row) == abs(diff_col) && abs(diff_row) <= 2 && diff_row != 0) || (diff_col == 0 && diff_row != 0) || (diff_col != 0 && diff_row == 0)){
      var a = 1;
      var b = 1;
      if(diff_row < 0){
        a = -1;
      }
      if(diff_col < 0){
        b = -1;
      }
      //前後の処理
      if(diff_col == 0){
        for(let i=1;i<abs(diff_row);i++){
          if(board_data[base_row-i*a][base_col][0] != 0){
            move = 0;
          }
        }
      }
      //左右の処理
      else if(diff_row == 0){
        for(let i=1;i<abs(diff_col);i++){
          if(board_data[base_row][base_col-i*b][0] != 0){
            move = 0;
          }
        }
      }
      //斜めの処理
      else{
        for(let i=1;i<abs(diff_row);i++){
          if(board_data[base_row-i*a][base_col-i*b][0] != 0){
            move = 0;
          }
        }
      }
    } 
  }
  //師の処理
  else if(base_number == 10){
    if(base_high == 0){
      if(abs(diff_row) <= 1 && abs(diff_col) <= 1 && !(diff_row == 0 && diff_col == 0)){
        move = 1;
      }
    }
    else{
      if((abs(diff_col) == abs(diff_row) && diff_row != 0 && abs(diff_row) <= 2) || (abs(diff_row) <= 2 && diff_row != 0 && diff_col == 0) || (abs(diff_col) <= 2 && diff_col != 0 && diff_row == 0)){
        move = 1;
      }
    }
    //途中に駒があるか
    if((abs(diff_col) == abs(diff_row) && diff_row != 0 && abs(diff_row) <= 2) || (abs(diff_row) <= 2 && diff_row != 0 && diff_col == 0) || (abs(diff_col) <= 2 && diff_col != 0 && diff_row == 0)){
      var a = 1;
      var b = 1;
      if(diff_row < 0){
        a = -1;
      }
      if(diff_col < 0){
        b = -1;
      }
      //前後の処理
      if(diff_col == 0){
        for(let i=1;i<abs(diff_row);i++){
          if(board_data[base_row-i*a][base_col][0] != 0){
            move = 0;
          }
        }
      }
      //左右の処理
      else if(diff_row == 0){
        for(let i=1;i<abs(diff_col);i++){
          if(board_data[base_row][base_col-i*b][0] != 0){
            move = 0;
          }
        }
      }
      //斜めの処理
      else{
        for(let i=1;i<abs(diff_row);i++){
          if(board_data[base_row-i*a][base_col-i*b][0] != 0){
            move = 0;
          }
        }
      }
    }
  }
  return move;
}

function change_turn() {
  selected_piece_number = 0;
  selected_piece_row = 0;
  selected_piece_col = 0;
  selected_piece_high = 0;
  piece_select_status = 0;
  tuke_flag = 0;
  reverse_flag = false
  if(my_turn){
    my_turn = false;
    turn_end();
    console.log('相手のターンです')

    // 追加
    var turn="相手の番"
    // 
  }
  else{
    my_turn = true;
    console.log('自分のターンです')

    // 追加
    var turn="自分の番"

    // element.innerHTML = turn;
  }
  return turn;
}

function take_king(){
  console.log('敵の王を取りました。')
  win();
}

function tuke_true(){
  console.log('次の手で駒をツケます（デフォルトで駒はツケない）')
  tuke_flag = 1;
}

function tuke_false(){
  console.log('次の手で駒をツケません')
  tuke_flag = 0;
}

function board_commu(){
  gungi.emit("client_board",board_data);
}
gungi.on("server_board",function(data){
  board_data=data;
})

function turn_end(){
  gungi.emit("myturn_end",board_data);

  // 追加（ターン）
  var turn="相手の番"
  var element = document.getElementById('turn');
  element.innerHTML = turn;
  //
  
}
gungi.on("yourturn_start",function(){
  console.log("connection ok");
  // change_turn();
  var turn = change_turn();

  // 追加(ターン)
  var element = document.getElementById('turn');
  element.innerHTML = turn;
  //
})

gungi.on("your_player_num",function(data){
  player_num=data;
  console.log(player_num);
})

function win(){
  gungi.emit("I_win",board_data);
  console.log("あなたの勝ちです!");

  // 追加（勝ち負け)
  var result="あなたの勝ちです";
  var element = document.getElementById('finish');
  element.innerHTML = result;
  my_turn=false;
  // 
}

function lose(){
  console.log("あなたの負けです");
  my_turn=false;
}

gungi.on("you_lose",function(){
  lose();

  // 追加（勝ち負け）
  var result="あなたの負けです";
  var element = document.getElementById('finish');
  element.innerHTML = result;
  // 
})

gungi.on("game_over",function(){
  my_turn=false;
  console.log("ゲーム終了です");
})
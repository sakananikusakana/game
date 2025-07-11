const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const retryButton = document.getElementById('retryButton');
const controlsInfo = document.getElementById('controlsInfo'); // 操作説明の要素を取得
const gameOverMessage = document.createElement('div'); // ゲームオーバーメッセージ用の要素を作成
gameOverMessage.id = 'gameOverMessage';
gameOverMessage.textContent = 'ゲームオーバー！';
document.body.insertBefore(gameOverMessage, canvas.nextSibling); // canvasの下に挿入

// ボールの設定
let ballRadius = 10;
let x; // 初期位置はstartGameで設定
let y; // 初期位置はstartGameで設定
let dx; // 初期速度はstartGameで設定
let dy; // 初期速度はstartGameで設定

// パドルの設定
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX; // 初期位置はstartGameで設定

// キーボード入力の状態
let rightPressed = false;
let leftPressed = false;

// ブロックの設定
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 50;
const brickHeight = 15;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let score = 0;
let gameStarted = false;
let animationFrameId; // requestAnimationFrameのIDを保持する変数

// ブロックの配列
let bricks = []; // ここをletに変更して再初期化可能に

// ゲームの状態を初期化する関数
function initializeGame() {
    x = canvas.width / 2; // ボールのX座標をキャンバスの中央に設定
    y = canvas.height - 30; // ボールのY座標をパドルの少し上に設定
    dx = 2; // ボールのX方向の速度
    dy = -2; // ボールのY方向の速度
    paddleX = (canvas.width - paddleWidth) / 2; // パドルのX座標をキャンバスの中央に設定
    score = 0; // スコアをリセット

    bricks = []; // ブロックの配列をクリア
    for (let c = 0; c < brickColumnCount; c++) { // 列ごとにループ
        bricks[c] = []; // 新しい列の配列を作成
        for (let r = 0; r < brickRowCount; r++) { // 行ごとにループ
            bricks[c][r] = { x: 0, y: 0, status: 1 }; // 各ブロックを初期化 (status: 1 は「存在する」)
        }
    }

    rightPressed = false; // 右キーの状態をリセット
    leftPressed = false; // 左キーの状態をリセット
}

// キーが押された時のイベントハンドラ
document.addEventListener("keydown", keyDownHandler, false);
// キーが離された時のイベントハンドラ
document.addEventListener("keyup", keyUpHandler, false);
// キャンバスがタッチされた時のイベントハンドラ (スマートフォン向け)
canvas.addEventListener("touchstart", touchStartHandler, false);
// キャンバス上でタッチが移動した時のイベントハンドラ (スマートフォン向け)
canvas.addEventListener("touchmove", touchMoveHandler, false);
// キャンバスからタッチが離された時のイベントハンドラ (スマートフォン向け)
canvas.addEventListener("touchend", touchEndHandler, false);
// スタートボタンがクリックされた時のイベントハンドラ
startButton.addEventListener("click", startGame, false);
// リトライボタンがクリックされた時のイベントハンドラ
retryButton.addEventListener("click", retryGame, false);

// キーダウン時の処理
function keyDownHandler(e) {
    if (!gameStarted) return; // ゲームが開始されていない場合は何もしない
    if (e.key === "Right" || e.key === "ArrowRight") { // 右矢印キーが押されたら
        rightPressed = true; // 右移動フラグをtrueに
    } else if (e.key === "Left" || e.key === "ArrowLeft") { // 左矢印キーが押されたら
        leftPressed = true; // 左移動フラグをtrueに
    }
}

// キーアップ時の処理
function keyUpHandler(e) {
    if (!gameStarted) return; // ゲームが開始されていない場合は何もしない
    if (e.key === "Right" || e.key === "ArrowRight") { // 右矢印キーが離されたら
        rightPressed = false; // 右移動フラグをfalseに
    } else if (e.key === "Left" || e.key === "ArrowLeft") { // 左矢印キーが離されたら
        leftPressed = false; // 左移動フラグをfalseに
    }
}

// タッチ開始時の処理 (スマートフォン向け)
function touchStartHandler(e) {
    if (!gameStarted) return; // ゲームが開始されていない場合は何もしない
    if (e.touches.length > 0) { // タッチが存在する場合
        const touchX = e.touches[0].clientX; // タッチのX座標を取得
        // キャンバスの左端からの相対位置を計算
        const relativeX = touchX - canvas.getBoundingClientRect().left;
        if (relativeX > canvas.width / 2) { // 画面の右半分をタップしたら
            rightPressed = true; // 右移動フラグをtrueに
        } else { // 画面の左半分をタップしたら
            leftPressed = true; // 左移動フラグをtrueに
        }
    }
}

// タッチ移動時の処理 (スマートフォン向け)
function touchMoveHandler(e) {
    if (!gameStarted) return; // ゲームが開始されていない場合は何もしない
    if (e.touches.length > 0) { // タッチが存在する場合
        const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left; // キャンバス内の相対X座標
        if (relativeX > 0 && relativeX < canvas.width) { // キャンバスの範囲内であれば
            paddleX = relativeX - paddleWidth / 2; // パドルの中心が指の位置になるように移動
        }
    }
}

// タッチ終了時の処理 (スマートフォン向け)
function touchEndHandler(e) {
    rightPressed = false; // 右移動フラグをfalseに
    leftPressed = false; // 左移動フラグをfalseに
}

// ゲーム開始関数
function startGame() {
    gameStarted = true; // ゲーム開始フラグをtrueに
    startButton.style.display = 'none'; // スタートボタンを非表示に
    retryButton.style.display = 'none'; // リトライボタンを非表示に
    gameOverMessage.style.display = 'none'; // ゲームオーバーメッセージを非表示に
    controlsInfo.style.display = 'none'; // 操作説明を非表示にする
    canvas.style.display = 'block'; // キャンバスを表示する

    initializeGame(); // ゲームの状態を初期化
    animationFrameId = requestAnimationFrame(draw); // ゲームループを開始し、IDを保持
}

// リトライ関数
function retryGame() {
    // 実行中のアニメーションフレームをキャンセルして、新しいゲームループを開始する前に古いループを停止する
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    startGame(); // startGame関数を再利用してゲームを再開
}

// ボールを描画する関数
function drawBall() {
    ctx.beginPath(); // 新しいパスを開始
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2); // 円を描画 (中心x, 中心y, 半径, 開始角度, 終了角度)
    ctx.fillStyle = "#0095DD"; // 塗りつぶし色を設定
    ctx.fill(); // パスを塗りつぶす
    ctx.closePath(); // パスを閉じる
}

// パドルを描画する関数
function drawPaddle() {
    ctx.beginPath(); // 新しいパスを開始
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight); // 四角形を描画 (x, y, 幅, 高さ)
    ctx.fillStyle = "#0095DD"; // 塗りつぶし色を設定
    ctx.fill(); // パスを塗りつぶす
    ctx.closePath(); // パスを閉じる
}

// ブロックを描画する関数
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) { // 列ごとにループ
        for (let r = 0; r < brickRowCount; r++) { // 行ごとにループ
            if (bricks[c][r].status === 1) { // ブロックが存在する場合のみ描画
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft; // ブロックのX座標を計算
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop; // ブロックのY座標を計算
                bricks[c][r].x = brickX; // ブロックオブジェクトにX座標を保存
                bricks[c][r].y = brickY; // ブロックオブジェクトにY座標を保存
                ctx.beginPath(); // 新しいパスを開始
                ctx.rect(brickX, brickY, brickWidth, brickHeight); // 四角形を描画
                ctx.fillStyle = "#0095DD"; // 塗りつぶし色を設定
                ctx.fill(); // パスを塗りつぶす
                ctx.closePath(); // パスを閉じる
            }
        }
    }
}

// スコアを表示する関数
function drawScore() {
    ctx.font = "16px Arial"; // フォントを設定
    ctx.fillStyle = "#0095DD"; // 色を設定
    ctx.fillText("Score: " + score, 8, 20); // テキストを描画 (テキスト, x, y)
}

// ボールとブロックの衝突判定関数
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) { // 列ごとにループ
        for (let r = 0; r < brickRowCount; r++) { // 行ごとにループ
            const b = bricks[c][r]; // 現在のブロックを取得
            if (b.status === 1) { // ブロックが存在する場合のみ判定
                // ボールがブロックの範囲内に入っているか
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy; // ボールのY方向の速度を反転
                    b.status = 0; // ブロックを消す (statusを0に)
                    score++; // スコアを増やす
                    if (score === brickRowCount * brickColumnCount) { // すべてのブロックを破壊したら
                        alert("おめでとうございます！すべてのブロックを破壊しました！"); // クリアメッセージ
                        endGame(); // ゲーム終了処理
                    }
                }
            }
        }
    }
}

// ゲームクリア時の終了処理
function endGame() {
    gameStarted = false; // ゲームを停止
    cancelAnimationFrame(animationFrameId); // アニメーションループを停止
    canvas.style.display = 'none'; // キャンバスを非表示に
    retryButton.style.display = 'block'; // リトライボタンを表示
    gameOverMessage.style.display = 'none'; // ゲームオーバーメッセージは非表示
    controlsInfo.style.display = 'none'; // 操作説明も非表示のまま
}

// ゲームオーバー時の処理
function gameOver() {
    gameStarted = false; // ゲームを停止
    cancelAnimationFrame(animationFrameId); // アニメーションループを停止
    canvas.style.display = 'none'; // キャンバスを非表示に
    gameOverMessage.style.display = 'block'; // ゲームオーバーメッセージを表示
    retryButton.style.display = 'block'; // リトライボタンを表示
    controlsInfo.style.display = 'none'; // 操作説明は非表示のまま
}

// ゲームの描画と更新を行うメインループ関数
function draw() {
    if (!gameStarted) { // ゲームが開始されていない場合は何もしない
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバス全体をクリア
    drawBricks(); // ブロックを描画
    drawBall(); // ボールを描画
    drawPaddle(); // パドルを描画
    drawScore(); // スコアを描画
    collisionDetection(); // 衝突判定を行う

    // ボールが左右の壁に当たった場合の処理
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx; // X方向の速度を反転
    }
    // ボールが上壁に当たった場合の処理
    if (y + dy < ballRadius) {
        dy = -dy; // Y方向の速度を反転
    } else if (y + dy > canvas.height - ballRadius) { // ボールが下部に到達した場合
        // ボールがパドルに当たった場合の処理
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy; // Y方向の速度を反転
        } else {
            gameOver(); // パドルをすり抜けたらゲームオーバー
            return; // drawループを停止
        }
    }

    // パドルの移動処理
    if (rightPressed && paddleX < canvas.width - paddleWidth) { // 右キーが押されていて、パドルが右端に達していない場合
        paddleX += 7; // パドルを右に移動
    } else if (leftPressed && paddleX > 0) { // 左キーが押されていて、パドルが左端に達していない場合
        paddleX -= 7; // パドルを左に移動
    }

    x += dx; // ボールのX座標を更新
    y += dy; // ボールのY座標を更新

    animationFrameId = requestAnimationFrame(draw); // 次のフレームを要求し、IDを保持
}

// 最初のゲーム初期化。ゲーム開始前の変数状態を適切に設定。
initializeGame();

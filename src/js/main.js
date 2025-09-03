var canvas, ctx, player, monster, boss;
let gameState = 'startMenu';
let gameMode = 'normal';
let score = 0;
let highScore = 0;
const GRAVITY = 0.8;
const JUMP_STRENGTH = -13;
let attackEffects = [];
let bossProjectiles = [];
let playerProjectiles = [];
let mousePos = { x: 0, y: 0 };
const ATTACK_DISPLAY_TIME = 200;

const buttons = {
    play: { x: 0, y: 0, width: 150, height: 50, text: "PLAY" },
    instructions: { x: 0, y: 0, width: 150, height: 50, text: "How to Play" },
    restart: { x: 0, y: 0, width: 150, height: 50, text: "RESTART" },
    mainMenu: { x: 0, y: 0, width: 150, height: 50, text: "MAIN MENU" },
    back: { x: 0, y: 0, width: 150, height: 50, text: "BACK" }
};

async function main() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    const savedHighScore = localStorage.getItem('myGameHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore, 10);
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    buttons.play.x = centerX - buttons.play.width / 2;
    buttons.play.y = centerY + 50 - buttons.play.height / 2;
    buttons.instructions.x = centerX - buttons.instructions.width / 2;
    buttons.instructions.y = centerY + 90;
    buttons.restart.x = centerX - buttons.restart.width / 2;
    buttons.restart.y = centerY + 50;
    buttons.mainMenu.x = centerX - buttons.mainMenu.width / 2;
    buttons.mainMenu.y = centerY + 120;
    buttons.back.x = centerX - buttons.back.width / 2;
    buttons.back.y = canvas.height - 80;

    background = new Background("src/public/images/bridgeBack.gif", "src/public/images/bridgeFront.gif");
    background.setSize(canvas.width, 10);
    await background.preloadGifs();

    player = new Player(100, 250);
    monster = new Monster(canvas.width, canvas.height);
    boss = new BossMonster(canvas.width, canvas.height);

    await player.preloadGifs();

    document.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    gameLoop();
}

function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = event.clientX - rect.left;
    mousePos.y = event.clientY - rect.top;
}

// [FIXED] 키 입력 함수를 올바르게 수정했습니다.
function handleKeyDown(e) {
    if (e.repeat) return;

    if (e.code === "Escape") {
        if (gameState === 'playing') gameState = 'paused';
        else if (gameState === 'paused') gameState = 'playing';
        return;
    }
    if (gameState !== 'playing') return;

    // 'D' 키를 누르면 공격 애니메이션과 함께 투사체를 발사합니다.
    if (e.code === "KeyD") {
        if (!player.isAttacking) {
            player.attack(); // 1. 공격 애니메이션만 재생합니다.
            player.shootProjectile(mousePos.x, mousePos.y); // 2. 마우스 위치로 투사체를 발사합니다.
        }
    }
    if (e.code === "Space") {
        player.jump();
    }
}

function isMouseInRect(mouseX, mouseY, rect) {
    return mouseX >= rect.x && mouseX <= rect.x + rect.width &&
        mouseY >= rect.y && mouseY <= rect.y + rect.height;
}

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    switch (gameState) {
        case 'startMenu':
            if (isMouseInRect(mouseX, mouseY, buttons.play)) resetGame(true);
            else if (isMouseInRect(mouseX, mouseY, buttons.instructions)) gameState = 'instructions';
            break;
        case 'instructions':
            if (isMouseInRect(mouseX, mouseY, buttons.back)) gameState = 'startMenu';
            break;
        case 'gameOver':
            if (isMouseInRect(mouseX, mouseY, buttons.restart)) resetGame();
            else if (isMouseInRect(mouseX, mouseY, buttons.mainMenu)) gameState = 'startMenu';
            break;
    }
}

function resetGame(isFirstStart = false) {
    player.reset();
    monster.alive = false;
    boss.alive = false;
    attackEffects = [];
    bossProjectiles = [];
    playerProjectiles = []; // 투사체 배열 초기화
    score = 0;
    gameMode = 'normal';
    gameState = 'playing';
    if (isFirstStart) log("게임 시작!");
    else log("게임을 재시작합니다.");
    monster.spawn();
}

function triggerBossFight() {
    log("경고! 강력한 적이 나타났습니다!");
    gameMode = 'boss';
    monster.alive = false;
    boss.spawn();
}

function checkCollision(proj, target) {
    const targetWidth = target.size || target.width;
    const targetHeight = target.size || target.height;
    return Math.abs(proj.x - target.x) < (proj.width + targetWidth) / 2 &&
        Math.abs(proj.y - target.y) < (proj.height + targetHeight) / 2;
}


function checkAndUpdateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('myGameHighScore', highScore);
        log(`최고 기록 갱신! ${highScore}점`);
    }
}

// --- Drawing Functions ---

function drawStartMenu(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Eternal Stand", canvas.width / 2, 150);
    ctx.fillStyle = "gold";
    ctx.font = "24px Arial";
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, 220);
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(buttons.play.x, buttons.play.y, buttons.play.width, buttons.play.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText(buttons.play.text, canvas.width / 2, buttons.play.y + 35);
    ctx.fillStyle = "#2196F3";
    ctx.fillRect(buttons.instructions.x, buttons.instructions.y, buttons.instructions.width, buttons.instructions.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText(buttons.instructions.text, canvas.width / 2, buttons.instructions.y + 32);
}

function drawInstructionsScreen(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("How to Play", canvas.width / 2, 100);
    ctx.font = "24px Arial";
    ctx.fillText("Space Bar: Jump", canvas.width / 2, 180);
    ctx.fillText("D Key: Attack (towards mouse)", canvas.width / 2, 230);
    ctx.fillText("ESC Key: Pause", canvas.width / 2, 280);
    ctx.fillStyle = "#607D8B";
    ctx.fillRect(buttons.back.x, buttons.back.y, buttons.back.width, buttons.back.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText(buttons.back.text, canvas.width / 2, buttons.back.y + 32);
}

function drawPausedScreen(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press ESC to resume", canvas.width / 2, canvas.height / 2 + 50);
}

function drawGameOverScreen(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 80);
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px Arial";
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillStyle = "#1E90FF";
    ctx.fillRect(buttons.restart.x, buttons.restart.y, buttons.restart.width, buttons.restart.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText(buttons.restart.text, canvas.width / 2, buttons.restart.y + 35);
    ctx.fillStyle = "#9E9E9E";
    ctx.fillRect(buttons.mainMenu.x, buttons.mainMenu.y, buttons.mainMenu.width, buttons.mainMenu.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText(buttons.mainMenu.text, canvas.width / 2, buttons.mainMenu.y + 35);
}

function drawUI(ctx) {
    const barWidth = 250;
    const barHeight = 25;
    const playerBarX = 20;
    const playerBarY = 20;
    ctx.fillStyle = "#333";
    ctx.fillRect(playerBarX, playerBarY, barWidth, barHeight);
    const playerHpRatio = player.hp > 0 ? player.hp / player.maxHp : 0;
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(playerBarX, playerBarY, barWidth * playerHpRatio, barHeight);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`PLAYER: ${player.hp} / ${player.maxHp}`, playerBarX + 10, playerBarY + 18);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Score: ${score}`, canvas.width / 2, 40);
    ctx.textAlign = "right";
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 20, 40);
    ctx.textAlign = "start";

    if (gameMode === 'boss' && boss.alive) {
        const bossBarWidth = canvas.width - 40;
        const bossBarHeight = 20;
        const bossBarX = 20;
        const bossBarY = canvas.height - 40;
        ctx.fillStyle = "#333";
        ctx.fillRect(bossBarX, bossBarY, bossBarWidth, bossBarHeight);
        const hpRatio = boss.hp / boss.maxHp;
        ctx.fillStyle = "red";
        ctx.fillRect(bossBarX, bossBarY, bossBarWidth * hpRatio, bossBarHeight);
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`BOSS HP: ${boss.hp} / ${boss.maxHp}`, canvas.width / 2, bossBarY + 15);
    }
}

function drawAttackEffects() {
    const now = Date.now();
    attackEffects = attackEffects.filter(e => now - e.time < ATTACK_DISPLAY_TIME);
    attackEffects.forEach(e => {
        ctx.fillStyle = e.type === "player" ? "yellow" : "orange";
        ctx.font = "20px Arial";
        ctx.fillText(`-${e.dmg}`, e.x - 10, e.y - 20);
    });
}

function log(msg) {
    console.log(msg)
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (['playing', 'paused', 'gameOver'].includes(gameState)) {
        // 1) 뒤 배경(far) 그리기 (background.updateAndDraw은 far를 렌더해서 즉시 메인 ctx에 그립니다)
        if (background) background.updateAndDraw(ctx);

        // 2) 플레이어 / 몬스터 / 보스 그리기 (배경 위)
        player.draw(ctx);
        monster.draw(ctx);
        if (boss.alive) boss.draw(ctx);

        // 3) 앞 배경(near) 그리기 — 플레이어보다 앞에 보이게 함
        if (background) background.drawNear(ctx);

        // 4) 투사체들(앞 배경 위에 보이게 하려면 drawNear 호출 이전으로 이동하세요)
        playerProjectiles.forEach(p => p.draw(ctx));
        bossProjectiles.forEach(p => p.draw(ctx));

        // 5) 공격 이펙트 & UI
        drawAttackEffects();
        drawUI(ctx);
    }

    switch (gameState) {
        case 'startMenu':
            drawStartMenu(ctx);
            break;
        case 'instructions':
            drawInstructionsScreen(ctx);
            break;
        case 'playing':
            player.update();
            monster.moveTowards(player);
            if (boss.alive) boss.update(player);

            // Player projectile logic
            playerProjectiles.forEach((p) => {
                p.update();
                if (monster.alive && checkCollision(p, monster)) {
                    monster.takeDamage(p.dmg);
                    attackEffects.push({ x: monster.x, y: monster.y, dmg: p.dmg, type: "player", time: Date.now() });
                    p.alive = false;
                }
                if (boss.alive && checkCollision(p, boss)) {
                    boss.takeDamage(p.dmg);
                    attackEffects.push({ x: boss.x, y: boss.y, dmg: p.dmg, type: "player", time: Date.now() });
                    p.alive = false;
                }
            });
            playerProjectiles = playerProjectiles.filter(p => p.alive);

            // Boss projectile logic
            bossProjectiles.forEach((p) => {
                p.update();
                const collided = Math.abs(p.x - player.x) < (p.size + player.width) / 2 &&
                    Math.abs(p.y - player.y) < (p.size + player.height) / 2;
                if (collided) {
                    player.takeDamage(10);
                    p.alive = false;
                }
            });
            bossProjectiles = bossProjectiles.filter(p => p.alive);

            break;
        case 'paused':
            drawPausedScreen(ctx);
            break;
        case 'gameOver':
            drawGameOverScreen(ctx);
            break;
    }

    requestAnimationFrame(gameLoop);
}

window.onload = main;


class Monster {
    constructor(canvasWidth, canvasHeight) {
        this.size = 50;
        this.speed = 6.5;
        this.minAttack = 5;
        this.maxAttack = 15;
        this.alive = false;
        this.hp = 50;
        this.maxHp = 50;
        this.x = 0;
        this.y = 0;
        this.spawnTimestamp = 0;
        this.moveDirX = 0;
        this.moveDirY = 0;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.gifReady = false;
        this.currentGif = null;

        this.gifs = {
            bug: "src/public/images/monster_bug.gif",
            eye: "src/public/images/monster_eye.gif",
        };

        this.animations = {};
    }

    async preloadGifs() {
        const promises = Object.entries(this.gifs).map(([type, url]) => {
            return new Promise((resolve, reject) => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 100;
                    canvas.height = 100;

                    gifler(url).get(anim => {
                        anim.animateInCanvas(canvas); // offscreen canvas에 렌더
                        this.animations[type] = { anim, canvas };
                        resolve();
                    });
                } catch (e) {
                    console.error(`Failed to load ${type} GIF:`, e);
                    reject(e);
                }
            });
        });
        await Promise.all(promises);
        this.gifReady = true;
    }

    spawn() {
        if (this.alive) return;
        const delay = Math.random() * 2000;
        setTimeout(() => {
            this.hp = 20 + Math.floor(Math.random() * 30);
            this.maxHp = this.hp;
            this.alive = true;
            this.x = this.canvasWidth + this.size;
            this.y = 50 + Math.random() * (this.canvasHeight - 100);
            this.spawnTimestamp = Date.now();
            log(`몬스터 등장! HP: ${this.hp}`);

            // 랜덤으로 bug 또는 eye 선택
            const keys = Object.keys(this.animations);
            this.currentGif = keys[Math.floor(Math.random() * keys.length)];

            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
                this.moveDirX = dx / distance;
                this.moveDirY = dy / distance;
            } else {
                this.moveDirX = -1;
                this.moveDirY = 0;
            }
        }, delay);
    }

    moveTowards(player) {
        if (!this.alive) return;
        this.x += this.moveDirX * this.speed;
        this.y += this.moveDirY * this.speed;
        if (this.x + this.size < 0) {
            this.alive = false;
            setTimeout(() => this.spawn(), 1000 + Math.random() * 4000);
            return;
        }
        const SPAWN_GRACE_PERIOD = 500;
        if (Date.now() - this.spawnTimestamp < SPAWN_GRACE_PERIOD) {
            return;
        }
        const collided = Math.abs(this.x - player.x) < (this.size + player.width) / 2 &&
            Math.abs(this.y - player.y) < (this.size + player.height) / 2;
        if (collided) {
            const dmg = this.minAttack + Math.floor(Math.random() * (this.maxAttack - this.minAttack + 1));
            player.takeDamage(dmg);
            attackEffects.push({ x: player.x, y: player.y, type: "monster", dmg, time: Date.now() });
            log(`몬스터가 플레이어에게 충돌! HP -${dmg}`);
            this.alive = false;
            setTimeout(() => this.spawn(), 1000 + Math.random() * 4000);
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        if (this.currentGif && this.animations[this.currentGif]) {
            const { canvas } = this.animations[this.currentGif];
            ctx.drawImage(
                canvas,
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
        } else {
            // GIF가 아직 없으면 기본 빨간 박스
            ctx.fillStyle = "red";
            ctx.fillRect(
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
        }
    }

    takeDamage(dmg) {
        if (!this.alive) return;
        this.hp -= dmg;
        log(`몬스터 -${dmg} → ${this.hp}`);
        if (this.hp <= 0) {
            this.alive = false;
            log("몬스터 처치!");

            score += 10;
            log(`점수 +10! 현재 점수: ${score}`);

            if (score > 0 && score % 10 === 0 && gameMode === 'normal') {
                triggerBossFight();
            } else {
                this.spawn();
            }
        }
    }
}
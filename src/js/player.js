class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 40;
        this.hp = 100;
        this.maxHp = 100;
        this.velY = 0;
        this.onGround = true;

        this.gifReady = false;
        this.isAttacking = false;
        this.currentGif = null;

        this.gifs = {
            run: "src/public/images/running.gif",
            attack_D: "src/public/images/D_Attack.gif",
            jump: "src/public/images/jump.gif",
            shoot: "src/public/images/shoot.gif",
            creative_shoot: "src/public/images/creative_shoot.gif"
        };

        this.animations = {}; // { type: { anim, canvas } }

        this.scalewidth = 3;
        this.scaleheight = 2.6;
        this.attackScalewidth = 2.7;
        this.attackScaleheight = 3.2;
    }

    // --- GIF preload ---
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
        this.loadGif("run"); // 초기 GIF
    }

    // 현재 사용할 GIF 선택
    loadGif(type) {
        if (!this.animations[type]) {
            console.error(`Animation '${type}' not preloaded!`);
            return;
        }
        this.currentGif = type;
    }

    // 플레이어 렌더
    draw(ctx) {
        if (!this.gifReady || !this.currentGif) {
            ctx.fillStyle = "cyan";
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            return;
        }

        const animData = this.animations[this.currentGif];
        let wScale = this.scalewidth;
        let hScale = this.scaleheight;

        if (this.isAttacking) {
            wScale = this.attackScalewidth;
            hScale = this.attackScaleheight;
        } else if (!this.onGround) {
            wScale = this.attackScalewidth * 1.7;
            hScale = this.attackScaleheight * 1.7;
        }

        ctx.drawImage(
            animData.canvas,
            this.x - (this.width * wScale) / 2,
            this.y - (this.height * hScale) / 2,
            this.width * wScale,
            this.height * hScale
        );
    }

    update() {
        if (!this.onGround) {
            this.velY += GRAVITY;
            this.y += this.velY;
            if (this.y >= 250) {
                this.y = 250;
                this.velY = 0;
                this.onGround = true;
                if (!this.isAttacking) this.loadGif("run");
            }
        }
    }

    jump() {
        if (this.onGround && !this.isAttacking) {
            this.velY = JUMP_STRENGTH;
            this.onGround = false;
            this.loadGif("jump");
        }
    }

    takeDamage(dmg) {
        this.hp -= dmg;
        log(`플레이어 HP -${dmg} → ${this.hp}`);
        if (this.hp <= 0) {
            this.hp = 0;
            log("플레이어 사망");
            checkAndUpdateHighScore();
            gameState = 'gameOver';
        }
    }

    attack() {
        if (this.isAttacking) return;
        this.isAttacking = true;
        this.loadGif("attack_D");
        setTimeout(() => {
            this.isAttacking = false;
            if (this.onGround) this.loadGif("run");
        }, 500);
    }

    shootProjectile(targetX, targetY) {
        const projectile = new PlayerProjectile(this.x, this.y, targetX, targetY, this.animations);
        playerProjectiles.push(projectile);
    }

    reset() {
        this.hp = this.maxHp;
        this.x = 100;
        this.y = 250;
        this.velY = 0;
        this.onGround = true;
        this.isAttacking = false;
        this.loadGif("run");
    }
}

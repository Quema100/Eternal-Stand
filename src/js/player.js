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

        this.gifCanvas = document.createElement("canvas");
        this.gifCanvas.width = 100;
        this.gifCanvas.height = 100;
        this.gifCtx = this.gifCanvas.getContext("2d");
        this.gifReady = false;

        this.isAttacking = false;
        this.currentGif = null;
        this.currentAnimation = null;

        this.gifs = {
            run: "src/public/images/running.gif",
            attack_D: "src/public/images/D_Attack.gif",
            shoot: "src/public/images/shoot.gif",
            creative_shoot: "src/public/images/creative_shoot.gif"
        };

        this.animations = {};
        this.scalewidth = 3;
        this.scaleheight = 2.6;
        this.attackScalewidth = 3;
        this.attackScaleheight = 3.3;
    }

    async preloadGifs() {
        const gifPromises = Object.entries(this.gifs).map(([type, url]) => {
            return new Promise((resolve, reject) => {
                try {
                    gifler(url).get(anim => {
                        this.animations[type] = anim;
                        resolve();
                    });
                } catch (e) {
                    console.error(`Failed to preload '${type}' GIF (${url})`, e);
                    reject(e);
                }
            });
        });
        await Promise.all(gifPromises);
    }

    loadGif(type) {
        if (this.currentAnimation) this.currentAnimation.stop();
        const anim = this.animations[type];
        if (!anim) {
            console.error(`Animation '${type}' not preloaded!`);
            return;
        }
        this.currentAnimation = anim;
        this.currentGif = type;
        this.gifCtx.clearRect(0, 0, this.gifCanvas.width, this.gifCanvas.height);
        this.currentAnimation.animateInCanvas(this.gifCanvas);
        this.gifReady = true;
    }

    draw(ctx) {
        if (this.gifReady) {
            let wScale = this.isAttacking ? this.attackScalewidth : this.scalewidth;
            let hScale = this.isAttacking ? this.attackScaleheight : this.scaleheight;
            ctx.drawImage(
                this.gifCanvas,
                this.x - (this.width * wScale) / 2,
                this.y - (this.height * hScale) / 2,
                this.width * wScale,
                this.height * hScale
            );
        } else {
            ctx.fillStyle = "cyan";
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
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
        // 아래와 같이 this.animations 대신 this.gifs를 전달합니다.
        const projectile = new PlayerProjectile(this.x, this.y, targetX, targetY, this.gifs);
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

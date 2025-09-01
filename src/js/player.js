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
    }

    draw(ctx) {
        ctx.fillStyle = "cyan";
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    update() {
        if (!this.onGround) {
            this.velY += GRAVITY;
            this.y += this.velY;
            if (this.y >= 250) {
                this.y = 250;
                this.velY = 0;
                this.onGround = true;
            }
        }
    }

    jump() {
        if (this.onGround) {
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

    attack(targets) {
        const attackRangeX = 550;
        const attackRangeY = 200;
        const inRange = targets.filter(target =>
            target.alive &&
            target.x > 0 && target.y > 0 &&
            Math.abs(this.x - target.x) < attackRangeX &&
            Math.abs(this.y - target.y) < attackRangeY
        );
        if (inRange.length === 0) return null;
        const target = inRange[0];
        const dmg = 10 + Math.floor(Math.random() * 20);
        target.takeDamage(dmg);
        log(`플레이어 공격! 대상 HP -${dmg}`);
        return { target: target, dmg: dmg };
    }

    reset() {
        this.hp = this.maxHp;
        this.x = 100;
        this.y = 250;
        this.velY = 0;
        this.onGround = true;
    }
}
class BossMonster {
    constructor(canvasWidth, canvasHeight) {
        this.width = 80;
        this.height = 80;
        this.hp = 1000;
        this.maxHp = 500;
        this.alive = false;
        this.x = 0;
        this.y = 0;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.ySpeed = 5;
        this.projectileCooldown = 500;
        this.lastProjectileTime = 0;
        this.summonCooldown = 8000;
        this.lastSummonTime = 0;
    }

    spawn() {
        this.alive = true;
        this.hp = this.maxHp;
        this.x = this.canvasWidth - (this.width + 120);
        this.y = this.canvasHeight / 2;
        this.lastProjectileTime = Date.now();
        this.lastSummonTime = Date.now();
    }

    update(player) {
        if (!this.alive) return;

        // 1. 제자리에서 위아래로만 이동
        this.y += this.ySpeed;
        if (this.y - this.height / 2 < 0 || this.y + this.height / 2 > this.canvasHeight) {
            this.ySpeed *= -1;
        }

        // 2. 투사체 발사 (쿨다운 확인)
        if (Date.now() - this.lastProjectileTime > this.projectileCooldown) {
            const projectile = new Projectile(this.x - this.width / 2, this.y, player.x, player.y);
            bossProjectiles.push(projectile);
            this.lastProjectileTime = Date.now();
            log("보스가 투사체를 발사합니다!");
        }
        
        // 3. 몬스터 소환
        if (Date.now() - this.lastSummonTime > this.summonCooldown) {
            if (!monster.alive) {
                monster.spawn(this.x, this.y);
                this.lastSummonTime = Date.now();
                log("보스가 몬스터를 소환합니다!");
            }
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.fillStyle = "purple";
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    takeDamage(dmg) {
        if (!this.alive) return;
        this.hp -= dmg;
        log(`보스 HP -${dmg} → ${this.hp}`);
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            log("보스 처치!");
            score += 50;
            log(`보너스 점수 +50! 현재 점수: ${score}`);
            gameMode = 'normal';
            monster.spawn();
        }
    }
}
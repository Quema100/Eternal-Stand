class PlayerProjectile {
    constructor(startX, startY, targetX, targetY, sharedAnims) {
        this.x = startX;
        this.y = startY - 60;
        this.width = 50;
        this.height = 50;
        this.speed = 12;
        this.alive = true;
        this.dmg = 20 + Math.floor(Math.random() * 15);

        this.sharedAnims = sharedAnims; // Player에서 preload된 GIF 재사용
        this.currentAnim = "creative_shoot";

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        this.moveDirX = distance > 0 ? dx / distance : 1;
        this.moveDirY = distance > 0 ? dy / distance : 0;

        setTimeout(() => {
            if (this.alive) this.currentAnim = "shoot";
        }, 500);
    }

    update() {
        this.x += this.moveDirX * this.speed;
        this.y += this.moveDirY * this.speed;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.alive = false;
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        const animData = this.sharedAnims[this.currentAnim];
        if (!animData) return;
        ctx.drawImage(
            animData.canvas,
            this.x - this.width/2,
            this.y - this.height/2,
            this.width*2,
            this.height*2
        );
    }
}

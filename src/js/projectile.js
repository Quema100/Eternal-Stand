class Projectile {
    constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        this.size = 15;
        this.speed = 8;
        this.alive = true;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.moveDirX = dx / distance;
            this.moveDirY = dy / distance;
        } else { 
            this.moveDirX = -1;
            this.moveDirY = 0;
        }
    }

    update() {
        // 저장된 방향으로 직진
        this.x += this.moveDirX * this.speed;
        this.y += this.moveDirY * this.speed;

        // 화면 밖으로 나가면 제거
        if (this.x + this.size < 0 || this.x - this.size > canvas.width || this.y + this.size < 0 || this.y - this.size > canvas.height) {
            this.alive = false;
        }
    }
    
    draw(ctx) {
        if (!this.alive) return;
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
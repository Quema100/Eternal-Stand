class PlayerProjectile {
    constructor(startX, startY, targetX, targetY, gifs) {
        this.x = startX;
        this.y = startY;
        this.width = 50;
        this.height = 50;
        this.speed = 12;
        this.alive = true;
        this.dmg = 15 + Math.floor(Math.random() * 15);

        this.gifCanvas = document.createElement("canvas");
        this.gifCanvas.width = 100;
        this.gifCanvas.height = 100;
        this.gifCtx = this.gifCanvas.getContext("2d");

        this.currentAnim = null;
        this.anims = {}; // 각 투사체만의 독립적인 애니메이션 저장소

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.moveDirX = distance > 0 ? dx / distance : 1;
        this.moveDirY = distance > 0 ? dy / distance : 0;

        // 생성자에서 비동기 초기화 함수를 호출합니다.
        this.initializeAnimations(gifs);
    }

    // 애니메이션을 비동기적으로 로드하고 재생하는 함수
    async initializeAnimations(gifs) {
        // Promise.all을 사용해 필요한 모든 GIF를 병렬로 로드합니다.
        const [creativeAnim, shootAnim] = await Promise.all([
            new Promise(resolve => gifler(gifs.creative_shoot).get(resolve)),
            new Promise(resolve => gifler(gifs.shoot).get(resolve))
        ]);

        // 로드된 독립적인 애니메이션을 이 투사체 인스턴스에 저장합니다.
        this.anims.creative_shoot = creativeAnim;
        this.anims.shoot = shootAnim;

        // 애니메이션 로드가 완료된 후에 첫 애니메이션을 재생합니다.
        this.loadGif("creative_shoot");

        // 0.2초 후에 두 번째 애니메이션으로 전환합니다.
        setTimeout(() => {
            if (this.alive) this.loadGif("shoot");
        }, 500);
    }

    loadGif(type) {
        const anim = this.anims[type];
        if (!anim) return; // 아직 애니메이션이 로드되지 않았으면 실행하지 않음

        if (this.currentAnim) this.currentAnim.stop();

        this.currentAnim = anim;
        this.gifCtx.clearRect(0, 0, this.gifCanvas.width, this.gifCanvas.height);
        this.currentAnim.animateInCanvas(this.gifCanvas);
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
        ctx.drawImage(
            this.gifCanvas,
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width * 2,
            this.height * 2
        );
    }
}
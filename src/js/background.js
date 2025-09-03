class Background {
    constructor(farUrl, nearUrl) {
        this.farUrl = farUrl;
        this.nearUrl = nearUrl;

        // Offscreen canvases
        this.farCanvas = document.createElement("canvas");
        this.farCtx = this.farCanvas.getContext("2d");

        this.nearCanvas = document.createElement("canvas");
        this.nearCtx = this.nearCanvas.getContext("2d");

        // GIF 경로 및 애니메이션 객체 저장소
        this.gifs = { far: farUrl, near: nearUrl };
        this.animations = { far: null, near: null };

        // 기본 사이즈
        this.setSize(800, 600);
    }

    setSize(width, height) {
        this.farCanvas.width = width;
        this.farCanvas.height = height;
        this.nearCanvas.width = width;
        this.nearCanvas.height = height;
    }

    // 병렬 GIF preload
    async preloadGifs() {
        const keys = Object.keys(this.gifs);
        const promises = keys.map(key => this._loadGifToAnim(key, this.gifs[key]));
        await Promise.all(promises);
    }

    // gifler 로드 + offscreen canvas 재생
    _loadGifToAnim(key, url) {
        return new Promise((resolve, reject) => {
            try {
                if (typeof gifler === 'undefined') {
                    throw new Error('gifler is not loaded.');
                }

                gifler(url).get(anim => {
                    if (!anim) {
                        reject(new Error(`No animation returned for ${url}`));
                        return;
                    }

                    this.animations[key] = anim;

                    // offscreen canvas에 재생
                    const canvas = key === 'far' ? this.farCanvas : this.nearCanvas;
                    anim.animateInCanvas(canvas);

                    resolve();
                });
            } catch (e) {
                console.error(`Failed to load GIF '${key}':`, e);
                reject(e);
            }
        });
    }

    // 매 프레임 호출: 뒤 배경 복사
    updateAndDraw(ctx) {
        const canvasW = ctx.canvas.width;
        const canvasH = ctx.canvas.height;

        if (this.farCanvas.width && this.farCanvas.height) {
            const scale = canvasH / this.farCanvas.height;
            const destW = Math.round(this.farCanvas.width * scale);
            const destH = canvasH;
            const dx = Math.round((canvasW - destW) / 2);

            ctx.drawImage(this.farCanvas, 0, 0, this.farCanvas.width, this.farCanvas.height,
                          dx, 0, destW, destH);
        } else {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvasW, canvasH);
        }
    }

    // 앞 배경 복사
    drawNear(ctx) {
        if (!(this.nearCanvas.width && this.nearCanvas.height)) return;

        const canvasW = ctx.canvas.width;
        const canvasH = ctx.canvas.height;

        const scale = canvasH / this.nearCanvas.height;
        const destW = Math.round(this.nearCanvas.width * scale);
        const destH = canvasH;
        const dx = Math.round((canvasW - destW) / 2);

        ctx.drawImage(this.nearCanvas, 0, 0, this.nearCanvas.width, this.nearCanvas.height,
                      dx, 0, destW, destH);
    }

    // 애니메이션 정지
    stopAll() {
        ['far','near'].forEach(k => {
            const a = this.animations[k];
            if (a && typeof a.stop === 'function') a.stop();
        });
    }
}

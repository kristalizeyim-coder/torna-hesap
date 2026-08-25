/* ============================================
   TORNA HESAP - Teknik Çizim Modülü (drawing.js)
   Canvas üzerinde X-Y koordinat düzlemi,
   Yan Yana Alyans Kesitleri ve Ölçü Çizgileri (Açık Tema)
   ============================================ */

class TechnicalDrawing {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('canvas-container');

        // Görünüm durumu
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;

        // Mod ve Veriler
        this.mode = 'normal'; // 'normal' veya 'kademeli'
        this.normalRing = { icCap: 0, disCap: 0 };
        this.innerRing = { icCap: 0, disCap: 0 };
        this.outerRing = { icCap: 0, disCap: 0 };
        this.params = {};

        // Etkileşim
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };

        // Açık Temiz Mühendislik Renkleri (Light Mode)
        this.colors = {
            background: '#ffffff',
            gridMinor: '#f1f5f9',
            gridMajor: '#e2e8f0',
            axis: '#94a3b8',
            axisLabel: '#64748b',
            tickLabel: '#64748b',
            // Normal Alyans
            innerCircle: '#2563eb', // Mavi
            outerCircle: '#0284c7', // Açık Mavi
            hatchStroke: 'rgba(37, 99, 235, 0.15)',
            // İki Kademeli Alyans
            innerRingStroke: '#059669', // Yeşil tonu (İç Parça)
            outerRingStroke: '#d97706', // Turuncu/Altın tonu (Dış Parça)
            innerRingHatch: 'rgba(5, 150, 105, 0.12)',
            outerRingHatch: 'rgba(217, 119, 6, 0.12)',
            // Ölçü Çizgileri
            dimensionLine: '#475569',
            dimensionText: '#0f172a',
            centerMark: '#94a3b8',
            infoBoxBg: 'rgba(248, 250, 252, 0.95)',
            infoBoxBorder: '#cbd5e1',
            infoText: '#475569',
            infoValue: '#0f172a',
        };

        this.dpr = window.devicePixelRatio || 1;
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.bindEvents();
        this.draw();
    }

    resizeCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    bindEvents() {
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom = Math.max(0.2, Math.min(15, this.zoom * factor));
            this.draw();
        }, { passive: false });

        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouse = { x: e.offsetX, y: e.offsetY };
            this.canvas.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.panX += x - this.lastMouse.x;
            this.panY += y - this.lastMouse.y;
            this.lastMouse = { x, y };
            this.draw();
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });

        this.resizeObserver = new ResizeObserver(() => {
            this.resizeCanvas();
            this.draw();
        });
        this.resizeObserver.observe(this.container);
    }

    // --- Public API ---

    drawNormalRing(icCap, disCap, params) {
        this.mode = 'normal';
        this.normalRing = { icCap, disCap };
        this.params = params || {};
        this.draw();
    }

    drawKademeliRings(innerRing, outerRing, params) {
        this.mode = 'kademeli';
        this.innerRing = innerRing;
        this.outerRing = outerRing;
        this.params = params || {};
        this.draw();
    }

    resetView() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.draw();
    }

    zoomIn() {
        this.zoom = Math.min(15, this.zoom * 1.3);
        this.draw();
    }

    zoomOut() {
        this.zoom = Math.max(0.2, this.zoom / 1.3);
        this.draw();
    }

    // --- Ana Çizim Döngüsü ---

    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.clearRect(0, 0, w, h);

        // Arka Plan (Beyaz)
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2 + this.panX;
        const cy = h / 2 + this.panY;

        // Ölçeklendirme
        let maxDia = 30;
        if (this.mode === 'normal' && this.normalRing.disCap > 0) {
            maxDia = this.normalRing.disCap;
        } else if (this.mode === 'kademeli') {
            maxDia = Math.max(this.innerRing.disCap, this.outerRing.disCap) * 2.2; // Yan yana sığsınlar
        }

        const maxDim = Math.min(w, h);
        const scale = ((maxDim * 0.4) / maxDia) * this.zoom;

        // Izgara ve Eksenler
        this.drawGrid(ctx, cx, cy, scale, w, h);
        this.drawAxes(ctx, cx, cy, scale, w, h);

        ctx.save();
        ctx.translate(cx, cy);

        if (this.mode === 'normal' && this.normalRing.icCap > 0) {
            this.renderSingleRing(ctx, 0, 0, this.normalRing.icCap, this.normalRing.disCap, scale, 'Normal Alyans', this.colors.innerCircle, this.colors.outerCircle, this.colors.hatchStroke);
        } else if (this.mode === 'kademeli' && this.innerRing.icCap > 0 && this.outerRing.icCap > 0) {
            // İKİ ALYANS YAN YANA ÇİZİLİYOR
            const spacing = (Math.max(this.innerRing.disCap, this.outerRing.disCap) * scale * 0.7) + 30;

            // 1. Sol Taraf: İÇ ALYANS
            this.renderSingleRing(ctx, -spacing, 0, this.innerRing.icCap, this.innerRing.disCap, scale, 'İÇ ALYANS PARÇASI', this.colors.innerRingStroke, this.colors.innerRingStroke, this.colors.innerRingHatch, true);

            // 2. Sağ Taraf: DIŞ ALYANS
            this.renderSingleRing(ctx, spacing, 0, this.outerRing.icCap, this.outerRing.disCap, scale, 'DIŞ ALYANS PARÇASI', this.colors.outerRingStroke, this.colors.outerRingStroke, this.colors.outerRingHatch, false);
        }

        ctx.restore();

        // Ölçek Çubuğu
        this.drawScaleBar(ctx, scale, w, h);
    }

    // Tek bir halkayı beliritilen merkez (offX, offY) koordinatında çizer
    renderSingleRing(ctx, offX, offY, icCap, disCap, scale, labelText, innerColor, outerColor, hatchColor, isInnerRing = false) {
        const innerR = (icCap / 2) * scale;
        const outerR = (disCap / 2) * scale;

        ctx.save();
        ctx.translate(offX, offY);

        // 1. Tarama (Hatching)
        if (outerR - innerR > 0.5) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, outerR, 0, Math.PI * 2);
            ctx.arc(0, 0, innerR, 0, Math.PI * 2, true);
            ctx.clip();

            ctx.strokeStyle = hatchColor;
            ctx.lineWidth = 1;
            const spacing = Math.max(4, (outerR - innerR) * 0.35);
            const R = outerR + 5;
            ctx.beginPath();
            for (let c = -2 * R; c <= 2 * R; c += spacing) {
                ctx.moveTo(-R, -R + c);
                ctx.lineTo(R, R + c);
            }
            ctx.stroke();
            ctx.restore();
        }

        // 2. Dış Daire
        ctx.strokeStyle = outerColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(0, 0, outerR, 0, Math.PI * 2);
        ctx.stroke();

        // 3. İç Daire
        ctx.strokeStyle = innerColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.arc(0, 0, innerR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 4. Merkez İşareti
        ctx.strokeStyle = this.colors.centerMark;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-8, 0); ctx.lineTo(8, 0);
        ctx.moveTo(0, -8); ctx.lineTo(0, 8);
        ctx.stroke();

        // 5. Başlık Etiketi
        ctx.font = '700 11px Inter, sans-serif';
        ctx.fillStyle = outerColor;
        ctx.textAlign = 'center';
        ctx.fillText(labelText, 0, -outerR - 25);

        // 6. Ölçülendirme Çizgileri
        const fontMono = 'JetBrains Mono, monospace';
        
        // İç Çap (Alt taraf)
        this.drawDimensionLine(ctx, -innerR, outerR + 15, innerR, outerR + 15, `Ø iç: ${icCap.toFixed(3)} mm`, innerColor, fontMono);

        // Dış Çap (Üst taraf)
        this.drawDimensionLine(ctx, -outerR, -outerR - 10, outerR, -outerR - 10, `Ø dış: ${disCap.toFixed(3)} mm`, outerColor, fontMono);

        ctx.restore();
    }

    drawDimensionLine(ctx, x1, y1, x2, y2, label, color, fontMono) {
        ctx.save();
        ctx.strokeStyle = this.colors.dimensionLine;
        ctx.lineWidth = 1;

        // Çizgi
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Oklar
        const arrow = 5;
        ctx.fillStyle = this.colors.dimensionLine;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + arrow, y1 - arrow / 2);
        ctx.lineTo(x1 + arrow, y1 + arrow / 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - arrow, y2 - arrow / 2);
        ctx.lineTo(x2 - arrow, y2 + arrow / 2);
        ctx.fill();

        // Etiket
        const midX = (x1 + x2) / 2;
        ctx.font = `600 10px ${fontMono}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Arka plan temizliği
        const tw = ctx.measureText(label).width + 6;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(midX - tw / 2, y1 - 6, tw, 12);

        ctx.fillStyle = color;
        ctx.fillText(label, midX, y1);

        ctx.restore();
    }

    drawGrid(ctx, cx, cy, scale, w, h) {
        const gridStep = this.niceStep(50 / scale);
        const gridPx = gridStep * scale;

        ctx.save();
        ctx.strokeStyle = this.colors.gridMinor;
        ctx.lineWidth = 0.8;

        const startX = (cx % gridPx) - gridPx;
        const startY = (cy % gridPx) - gridPx;

        ctx.beginPath();
        for (let x = startX; x < w; x += gridPx) {
            ctx.moveTo(x, 0); ctx.lineTo(x, h);
        }
        for (let y = startY; y < h; y += gridPx) {
            ctx.moveTo(0, y); ctx.lineTo(w, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    drawAxes(ctx, cx, cy, scale, w, h) {
        ctx.save();
        ctx.strokeStyle = this.colors.axis;
        ctx.lineWidth = 1;

        // X & Y Ekseni
        ctx.beginPath();
        ctx.moveTo(0, cy); ctx.lineTo(w, cy);
        ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.stroke();

        // Eksen Etiketleri
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = this.colors.axisLabel;
        ctx.fillText('X (mm)', w - 45, cy - 6);
        ctx.fillText('Y (mm)', cx + 8, 14);

        ctx.restore();
    }

    drawScaleBar(ctx, scale, w, h) {
        const barMm = this.niceStep(70 / scale);
        const barPx = barMm * scale;
        const x = 16;
        const y = h - 20;

        ctx.save();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + barPx, y);
        ctx.moveTo(x, y - 3); ctx.lineTo(x, y + 3);
        ctx.moveTo(x + barPx, y - 3); ctx.lineTo(x + barPx, y + 3);
        ctx.stroke();

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.fillText(`${barMm} mm`, x + barPx / 2, y - 6);
        ctx.restore();
    }

    niceStep(roughStep) {
        if (roughStep <= 0) return 1;
        const pow = Math.pow(10, Math.floor(Math.log10(roughStep)));
        const frac = roughStep / pow;
        let nice = 1;
        if (frac > 1.5 && frac <= 3) nice = 2;
        else if (frac > 3 && frac <= 7) nice = 5;
        else if (frac > 7) nice = 10;
        return nice * pow;
    }
}

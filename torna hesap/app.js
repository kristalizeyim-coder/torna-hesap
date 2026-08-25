/* ============================================
   TORNA HESAP - Hesaplama Mantığı (app.js)
   Normal ve İki Kademeli Alyans Hesap motoru
   ============================================ */

class AlyansCalculator {
    constructor() {
        this.drawing = null;
        this.currentType = 'normal';
        this.init();
    }

    init() {
        // Girdi elementleri - Ortak & Normal
        this.inputs = {
            boy: document.getElementById('input-boy'),
            // Normal alyans
            icTolerans: document.getElementById('input-ic-tolerans'),
            etKalinligi: document.getElementById('input-et-kalinligi'),
            disTolerans: document.getElementById('input-dis-tolerans'),
            // Kademeli alyans - İç Parça
            icParcaTolerans: document.getElementById('input-ic-parca-tolerans'),
            icParcaEt: document.getElementById('input-ic-parca-et'),
            icParcaDisTolerans: document.getElementById('input-ic-parca-dis-tolerans'),
            // Kademeli alyans - Dış Parça
            disParcaIslem: document.getElementById('input-dis-parca-islem'),
            disParcaGiris: document.getElementById('input-dis-parca-giris'),
            disParcaEt: document.getElementById('input-dis-parca-et'),
            disParcaTolerans: document.getElementById('input-dis-parca-tolerans'),
        };

        // Sonuç elementleri - Normal
        this.resultsNormal = {
            icCap: document.getElementById('result-ic-cap'),
            disCap: document.getElementById('result-dis-cap'),
            etToplam: document.getElementById('result-et-toplam'),
        };

        // Sonuç elementleri - Kademeli
        this.resultsKademeli = {
            icIc: document.getElementById('result-kademeli-ic-ic'),
            icDis: document.getElementById('result-kademeli-ic-dis'),
            disIc: document.getElementById('result-kademeli-dis-ic'),
            disDis: document.getElementById('result-kademeli-dis-dis'),
        };

        // Formüller
        this.formulas = {
            ic: document.getElementById('formula-ic'),
            dis: document.getElementById('formula-dis'),
            title1: document.getElementById('formula-title-1'),
            title2: document.getElementById('formula-title-2'),
        };

        this.hintBoy = document.getElementById('hint-boy');

        // Event Listeners
        Object.values(this.inputs).forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.calculate());
                input.addEventListener('change', () => this.calculate());
            }
        });

        // Tip Değiştirme Butonları
        const btnNormal = document.getElementById('btn-type-normal');
        const btnKademeli = document.getElementById('btn-type-kademeli');

        btnNormal.addEventListener('click', () => {
            this.setType('normal');
            btnNormal.classList.add('active');
            btnKademeli.classList.remove('active');
        });

        btnKademeli.addEventListener('click', () => {
            this.setType('kademeli');
            btnKademeli.classList.add('active');
            btnNormal.classList.remove('active');
        });

        this.calculate();
    }

    setDrawing(drawing) {
        this.drawing = drawing;
        this.calculate();
    }

    setType(type) {
        this.currentType = type;

        const groupNormal = document.getElementById('group-normal-inputs');
        const groupKademeli = document.getElementById('group-kademeli-inputs');
        const resultsNormal = document.getElementById('normal-results');
        const resultsKademeli = document.getElementById('kademeli-results');

        if (type === 'normal') {
            groupNormal.classList.remove('hidden');
            groupKademeli.classList.add('hidden');
            resultsNormal.classList.remove('hidden');
            resultsKademeli.classList.add('hidden');
            if (this.hintBoy) this.hintBoy.textContent = "Normal Alyans: Girilen beden direkt kullanılır";
        } else {
            groupNormal.classList.add('hidden');
            groupKademeli.classList.remove('hidden');
            resultsNormal.classList.add('hidden');
            resultsKademeli.classList.remove('hidden');
            if (this.hintBoy) this.hintBoy.textContent = "İki Kademeli: İç alyans 1 boy küçük hesaplanır";
        }

        this.calculate();
    }

    calculate() {
        if (this.currentType === 'normal') {
            this.calculateNormal();
        } else {
            this.calculateKademeli();
        }
    }

    // 1) NORMAL ALYANS HESABI
    calculateNormal() {
        const boy = parseFloat(this.inputs.boy.value) || 0;
        const icToleransMikron = parseFloat(this.inputs.icTolerans.value) || 0;
        const etKalinligiMikron = parseFloat(this.inputs.etKalinligi.value) || 0;
        const disToleransMikron = parseFloat(this.inputs.disTolerans.value) || 0;

        // İç Çap = (boy / π) - (icTolerans × 2 / 100)
        const hamCap = boy / Math.PI;
        const icToleransMm = (icToleransMikron * 2) / 100;
        const icCap = hamCap - icToleransMm;

        // Dış Çap = İç Çap + (etKalınlığı × 2 / 100) + (disTolerans × 2 / 100)
        const etEklenecekMm = (etKalinligiMikron * 2) / 100;
        const disTolerEklenecekMm = (disToleransMikron * 2) / 100;
        const disCap = icCap + etEklenecekMm + disTolerEklenecekMm;

        const etTekTaraf = (disCap - icCap) / 2;

        // Ekran güncelle
        this.resultsNormal.icCap.textContent = icCap > 0 ? icCap.toFixed(3) : '—';
        this.resultsNormal.disCap.textContent = disCap > 0 ? disCap.toFixed(3) : '—';
        this.resultsNormal.etToplam.textContent = etTekTaraf > 0 ? etTekTaraf.toFixed(3) : '—';

        if (this.formulas.title1) this.formulas.title1.textContent = 'İç Çap Formülü';
        if (this.formulas.title2) this.formulas.title2.textContent = 'Dış Çap Formülü';

        if (this.formulas.ic) {
            this.formulas.ic.innerHTML =
                `(${boy} / π) − (${icToleransMikron} × 2 / 100)<br>` +
                `= ${hamCap.toFixed(4)} − ${icToleransMm.toFixed(4)}<br>` +
                `= <strong>${icCap.toFixed(3)} mm</strong>`;
        }

        if (this.formulas.dis) {
            this.formulas.dis.innerHTML =
                `${icCap.toFixed(3)} + (${etKalinligiMikron} × 2 / 100) + (${disToleransMikron} × 2 / 100)<br>` +
                `= ${icCap.toFixed(3)} + ${etEklenecekMm.toFixed(4)} + ${disTolerEklenecekMm.toFixed(4)}<br>` +
                `= <strong>${disCap.toFixed(3)} mm</strong>`;
        }

        // Çizim güncelle
        if (this.drawing) {
            this.drawing.drawNormalRing(icCap, disCap, { boy, icToleransMikron, etKalinligiMikron, disToleransMikron });
        }
    }

    // 2) İKİ KADEMELİ ALYANS HESABI
    calculateKademeli() {
        const boy = parseFloat(this.inputs.boy.value) || 0;
        const boyKucuk = boy - 1; // İki kademelide 1 boy küçük alınıyor (60 yerine 59)

        // Girdiler - İç Alyans
        const icToleransMikron = parseFloat(this.inputs.icParcaTolerans.value) || 0;
        const icEtMikron = parseFloat(this.inputs.icParcaEt.value) || 0;
        const icDisToleransMikron = parseFloat(this.inputs.icParcaDisTolerans.value) || 0;

        // Girdiler - Dış Alyans
        const disIslemMikron = parseFloat(this.inputs.disParcaIslem.value) || 0;
        const disGirisMikron = parseFloat(this.inputs.disParcaGiris.value) || 0; // 50 mikron
        const disEtMikron = parseFloat(this.inputs.disParcaEt.value) || 0;
        const disToleransMikron = parseFloat(this.inputs.disParcaTolerans.value) || 0;

        // A) İÇ ALYANS HESAPLARI
        // İç Alyans İç Çap = (boyKucuk / π) - (2 × İç Tolerans / 100)
        const icHamCap = boyKucuk / Math.PI;
        const icParcaIcToleransMm = (icToleransMikron * 2) / 100;
        const icParcaIcCap = icHamCap - icParcaIcToleransMm;

        // İç Alyans Dış Çap = İç Çap + (et × 2 / 100) + (tolerans × 2 / 100)
        const icParcaEtMm = (icEtMikron * 2) / 100;
        const icParcaDisToleransMm = (icDisToleransMikron * 2) / 100;
        const icParcaDisCap = icParcaIcCap + icParcaEtMm + icParcaDisToleransMm;

        // B) DIŞ ALYANS HESAPLARI
        // Dış Alyans İç Çap = (İç Alyans Dış Çap + İç Et Kalınlığı x 2 + Tolerans x 2) - (İşlem Payı / 100) - (Giriş Payı × 2 / 100)
        const disParcaIcCapBase = icParcaDisCap + icParcaEtMm + icParcaDisToleransMm;
        const disIslemMm = disIslemMikron / 100;
        const disGirisMm = (disGirisMikron * 2) / 100;
        const disParcaIcCap = disParcaIcCapBase - disIslemMm - disGirisMm;

        // Dış Alyans Dış Çap = Dış İç Çap + (Et x 2 / 100) + (Tolerans x 2 / 100)
        const disParcaEtMm = (disEtMikron * 2) / 100;
        const disParcaToleransMm = (disToleransMikron * 2) / 100;
        const disParcaDisCap = disParcaIcCap + disParcaEtMm + disParcaToleransMm;

        // Ekran Güncelleme
        const labelIc = document.getElementById('label-kademeli-ic-ic');
        if (labelIc) labelIc.textContent = `İç Alyans İç Çap (${boyKucuk} boy)`;
        if (this.hintBoy) this.hintBoy.textContent = `İki Kademeli: İç alyans 1 boy küçük (${boyKucuk}) hesaplanır`;

        this.resultsKademeli.icIc.textContent = icParcaIcCap > 0 ? icParcaIcCap.toFixed(3) : '—';
        this.resultsKademeli.icDis.textContent = icParcaDisCap > 0 ? icParcaDisCap.toFixed(3) : '—';
        this.resultsKademeli.disIc.textContent = disParcaIcCap > 0 ? disParcaIcCap.toFixed(3) : '—';
        this.resultsKademeli.disDis.textContent = disParcaDisCap > 0 ? disParcaDisCap.toFixed(3) : '—';

        if (this.formulas.title1) this.formulas.title1.textContent = `İç Alyans Çapları (${boyKucuk} Boy)`;
        if (this.formulas.title2) this.formulas.title2.textContent = 'Dış Alyans Çapları';

        if (this.formulas.ic) {
            this.formulas.ic.innerHTML =
                `İç Çap: (${boyKucuk}/π) − (${icToleransMikron}×2/100) = <strong>${icParcaIcCap.toFixed(3)} mm</strong><br>` +
                `Dış Çap: ${icParcaIcCap.toFixed(3)} + (${icEtMikron}×2/100) + (${icDisToleransMikron}×2/100) = <strong>${icParcaDisCap.toFixed(3)} mm</strong>`;
        }

        if (this.formulas.dis) {
            this.formulas.dis.innerHTML =
                `Dış İç Çap: ${disParcaIcCapBase.toFixed(3)} − (${disIslemMikron}/100) − (${disGirisMikron}×2/100) = <strong>${disParcaIcCap.toFixed(3)} mm</strong><br>` +
                `Dış Dış Çap: ${disParcaIcCap.toFixed(3)} + (${disEtMikron}×2/100) + (${disToleransMikron}×2/100) = <strong>${disParcaDisCap.toFixed(3)} mm</strong>`;
        }

        // Teknik Çizim Güncelleme (Yan yana iç ve dış alyans)
        if (this.drawing) {
            this.drawing.drawKademeliRings(
                { icCap: icParcaIcCap, disCap: icParcaDisCap },
                { icCap: disParcaIcCap, disCap: disParcaDisCap },
                { boy, boyKucuk }
            );
        }
    }
}

// Uygulama başlat
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new AlyansCalculator();

    if (typeof TechnicalDrawing !== 'undefined') {
        const drawing = new TechnicalDrawing('technical-drawing');
        calculator.setDrawing(drawing);

        document.getElementById('btn-zoom-in').addEventListener('click', () => drawing.zoomIn());
        document.getElementById('btn-zoom-out').addEventListener('click', () => drawing.zoomOut());
        document.getElementById('btn-zoom-reset').addEventListener('click', () => drawing.resetView());
    }
});


const papan = document.getElementById("papan");
const skorTeks = document.getElementById("skor");
const rekorTeks = document.getElementById("rekor");
const levelTeks = document.getElementById("level");

const tombolMulai = document.getElementById("tombolMulai");
const tombolJeda = document.getElementById("tombolJeda");
const overlay = document.getElementById("overlay");
const judulOverlay = document.getElementById("judulOverlay");
const pesanOverlay = document.getElementById("pesanOverlay");

const jumlahKotak = 400;
const kotak = [];

let ular = [210, 209, 208];
let makanan = 100;
let arah = 1;
let arahBerikutnya = 1;

let skor = 0;
let rekor = Number(localStorage.getItem("rekorSnake")) || 0;
let level = 1;
let kecepatan = 200;

let interval = null;
let statusGame = "siap";

// Membuat papan 20 x 20
for (let i = 0; i < jumlahKotak; i++) {
    const elemen = document.createElement("div");
    elemen.classList.add("kotak");
    papan.appendChild(elemen);
    kotak.push(elemen);
}

// Memperbarui tampilan skor
function perbaruiInfo() {
    skorTeks.textContent = skor;
    rekorTeks.textContent = rekor;
    levelTeks.textContent = level;
}

// Menggambar ular dan makanan
function gambar() {
    kotak.forEach(elemen => {
        elemen.classList.remove("ular", "makanan");
    });

    ular.forEach(posisi => {
        kotak[posisi].classList.add("ular");
    });

    kotak[makanan].classList.add("makanan");
    perbaruiInfo();
}

// Membuat makanan di tempat kosong
function buatMakanan() {
    const kosong = [];

    for (let i = 0; i < jumlahKotak; i++) {
        if (!ular.includes(i)) {
            kosong.push(i);
        }
    }

    if (kosong.length === 0) {
        gameSelesai(true);
        return;
    }

    makanan = kosong[Math.floor(Math.random() * kosong.length)];
}

// Efek suara menggunakan browser
let audio = null;

function bunyi(frekuensi, durasi, jenis = "sine") {
    try {
        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) return;

        if (!audio) audio = new AudioContext();

        if (audio.state === "suspended") {
            audio.resume();
        }

        const oscillator = audio.createOscillator();
        const volume = audio.createGain();

        oscillator.type = jenis;
        oscillator.frequency.value = frekuensi;

        volume.gain.setValueAtTime(0.12, audio.currentTime);
        volume.gain.exponentialRampToValueAtTime(
            0.001,
            audio.currentTime + durasi
        );

        oscillator.connect(volume);
        volume.connect(audio.destination);

        oscillator.start();
        oscillator.stop(audio.currentTime + durasi);
    } catch (error) {
        // Game tetap berjalan jika suara tidak tersedia.
    }
}

function suaraMakan() {
    bunyi(700, 0.1);
}

function suaraGameOver() {
    bunyi(240, 0.25, "triangle");

    setTimeout(() => {
        bunyi(160, 0.4, "triangle");
    }, 180);
}

// Memulai interval gerakan
function jalankanInterval() {
    clearInterval(interval);
    interval = setInterval(gerak, kecepatan);
}

// Menggerakkan ular
function gerak() {
    if (statusGame !== "bermain") return;

    arah = arahBerikutnya;

    const kepala = ular[0];
    const kepalaBaru = kepala + arah;

    // Cek tabrakan dengan dinding
    if (
        (arah === 1 && kepala % 20 === 19) ||
        (arah === -1 && kepala % 20 === 0) ||
        kepalaBaru < 0 ||
        kepalaBaru >= jumlahKotak
    ) {
        gameSelesai(false);
        return;
    }

    const makan = kepalaBaru === makanan;

    // Ekor boleh ditinggalkan jika tidak sedang makan
    const tubuhYangDicek = makan ? ular : ular.slice(0, -1);

    if (tubuhYangDicek.includes(kepalaBaru)) {
        gameSelesai(false);
        return;
    }

    ular.unshift(kepalaBaru);

    if (makan) {
        skor += 10;
        suaraMakan();

        if (skor > rekor) {
            rekor = skor;
            localStorage.setItem("rekorSnake", rekor);
        }

        const levelBaru = Math.floor(skor / 50) + 1;

        if (levelBaru !== level) {
            level = levelBaru;
            kecepatan = Math.max(
                70,
                200 - (level - 1) * 20
            );

            jalankanInterval();
        }

        buatMakanan();

        if (statusGame !== "bermain") {
            gambar();
            return;
        }
    } else {
        ular.pop();
    }

    gambar();
}

// Menampilkan pesan dalam halaman
function tampilkanOverlay(judul, pesan) {
    judulOverlay.textContent = judul;
    pesanOverlay.textContent = pesan;
    overlay.classList.remove("sembunyi");
}

// Menyembunyikan pesan
function sembunyikanOverlay() {
    overlay.classList.add("sembunyi");
}

// Game selesai
function gameSelesai(menang) {
    clearInterval(interval);
    interval = null;
    statusGame = "selesai";

    tombolMulai.textContent = "Main Lagi";
    tombolJeda.disabled = true;

    if (menang) {
        tampilkanOverlay(
            "Kamu Menang! 🎉",
            "Semua kotak sudah dipenuhi ular!"
        );
    } else {
        suaraGameOver();

        tampilkanOverlay(
            "Game Over!",
            "Skor kamu: " + skor + ". Tekan Main Lagi untuk mencoba."
        );
    }
}

// Memulai atau mengulang permainan
function mulaiGame() {
    clearInterval(interval);
    interval = null;

    ular = [210, 209, 208];
    makanan = 100;
    arah = 1;
    arahBerikutnya = 1;
    skor = 0;
    level = 1;
    kecepatan = 200;
    statusGame = "bermain";

    buatMakanan();

    if (statusGame !== "bermain") return;

    gambar();
    sembunyikanOverlay();

    tombolMulai.textContent = "Mulai Ulang";
    tombolJeda.textContent = "Jeda";
    tombolJeda.disabled = false;

    jalankanInterval();
}

// Jeda dan lanjutkan
function toggleJeda() {
    if (statusGame === "bermain") {
        clearInterval(interval);
        interval = null;
        statusGame = "jeda";

        tombolJeda.textContent = "Lanjutkan";
        tampilkanOverlay(
            "Permainan Dijeda",
            "Tekan Lanjutkan untuk bermain lagi."
        );
    } else if (statusGame === "jeda") {
        statusGame = "bermain";
        sembunyikanOverlay();

        tombolJeda.textContent = "Jeda";
        jalankanInterval();
    }
}

// Mengubah arah dengan aman
function ubahArah(arahBaru) {
    if (statusGame !== "bermain") return;

    // Mencegah berbalik langsung ke arah berlawanan
    if (arahBaru + arah === 0) return;

    arahBerikutnya = arahBaru;
}

// Kontrol keyboard
document.addEventListener("keydown", function(event) {
    const tombol = event.key;

    const arahKeyboard = {
        ArrowUp: -20,
        ArrowDown: 20,
        ArrowLeft: -1,
        ArrowRight: 1
    };

    if (arahKeyboard[tombol] !== undefined) {
        event.preventDefault();
        ubahArah(arahKeyboard[tombol]);
    }

    if (tombol === " " && statusGame !== "selesai") {
        event.preventDefault();
        toggleJeda();
    }
});

// Kontrol arah di layar
document.querySelectorAll(".arah").forEach(tombol => {
    tombol.addEventListener("click", function() {
        const arahTombol = {
            atas: -20,
            bawah: 20,
            kiri: -1,
            kanan: 1
        };

        ubahArah(arahTombol[this.dataset.arah]);
    });
});

// Tombol permainan
tombolMulai.addEventListener("click", mulaiGame);
tombolJeda.addEventListener("click", toggleJeda);

// Tampilan awal
rekorTeks.textContent = rekor;
gambar();

tampilkanOverlay(
    "Siap Bermain? 🐍",
    "Tekan Mulai Game untuk memulai."
);

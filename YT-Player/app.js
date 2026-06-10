// Memasukkan API Key YouTube Data API v3 milik Anda
const API_KEY = "AIzaSyBxBsXHbC2hu6qRO6NBOcZTvLcoxxChWvA";

let ytPlayer;
let playlist = [];
let currentTrackIndex = 0;
let progressInterval;
let animationId;

// DOM Elemen
const btnPlay = document.getElementById('btn-play');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const trackTitle = document.getElementById('track-title');
const timeDisplay = document.getElementById('time-display');
const progressBar = document.getElementById('progress-bar');
const playlistContainer = document.getElementById('playlist-container');
const searchInput = document.getElementById('search-input');
const btnSearch = document.getElementById('btn-search');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

// 1. Inisialisasi Player YouTube secara otomatis dari API script Google
window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('yt-player-hidden', {
        height: '0',
        width: '0',
        videoId: '', 
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
};

// 2. Fungsi Tombol Cari Musik menggunakan API YouTube
async function searchMusic(query) {
    if (!query) return;
    playlistContainer.innerHTML = "<p style='color:#888; padding:10px;'>Mencari lagu...</p>";
    
    const url = `https://googleapis.com{encodeURIComponent(query)}&type=video&key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            playlist = data.items.map(item => ({
                title: item.snippet.title,
                id: item.id.videoId
            }));
            
            // Simpan riwayat pencarian terakhir ke memori lokal untuk akses Offline
            localStorage.setItem('yt_offline_playlist', JSON.stringify(playlist));
            renderPlaylist();
            playTrack(0);
        } else {
            playlistContainer.innerHTML = "<p style='color:#ff5555; padding:10px;'>Lagu tidak ditemukan.</p>";
        }
    } catch (error) {
        console.error("Gagal memuat data API YouTube:", error);
        playlistContainer.innerHTML = "<p style='color:#ff5555; padding:10px;'>Koneksi gagal / Limit API habis.</p>";
    }
}

// Jalankan pencarian saat tombol diklik atau menekan Enter
btnSearch.addEventListener('click', () => searchMusic(searchInput.value));
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchMusic(searchInput.value); });

// 3. Logika Mengganti Lagu
function playTrack(index) {
    if (playlist.length === 0) return;
    currentTrackIndex = index;
    const track = playlist[index];
    
    trackTitle.innerHTML = track.title;
    ytPlayer.loadVideoById(track.id);
    btnPlay.innerText = "⏸ Pause";
    
    // Tandai lagu aktif di tampilan playlist
    document.querySelectorAll('.playlist-item').forEach((el, idx) => {
        if(idx === index) el.classList.add('active');
        else el.classList.remove('active');
    });
}

// 4. Memantau Status Player (Sedang berputar, Berhenti, Selesai)
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        btnPlay.innerText = "⏸ Pause";
        startTimelineUpdate();
        startVisualizerAnimation(); // Mulai animasi gerak saat lagu berbunyi
    } else {
        btnPlay.innerText = "▶ Play";
        clearInterval(progressInterval);
        cancelAnimationFrame(animationId); // Hentikan animasi saat dipause
    }

    // Otomatis putar lagu berikutnya jika lagu saat ini habis
    if (event.data === YT.PlayerState.ENDED) {
        btnNext.click();
    }
}

// 5. Update Menggeser Pengukur Waktu (Timeline)
function startTimelineUpdate() {
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if (ytPlayer && ytPlayer.getCurrentTime) {
            const currentTime = ytPlayer.getCurrentTime();
            const duration = ytPlayer.getDuration();
            
            if (duration > 0) {
                progressBar.value = (currentTime / duration) * 100;
                timeDisplay.innerText = `${formatTime(currentTime)} / ${formatTime(duration)}`;
            }
        }
    }, 1000);
}

progressBar.addEventListener('input', () => {
    if (ytPlayer && ytPlayer.getDuration) {
        const newTime = (progressBar.value / 100) * ytPlayer.getDuration();
        ytPlayer.seekTo(newTime, true);
    }
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

// 6. Kontrol Navigasi
btnPlay.addEventListener('click', () => {
    if (!ytPlayer) return;
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
    } else {
        ytPlayer.playVideo();
    }
});

btnNext.addEventListener('click', () => {
    if (playlist.length === 0) return;
    let nextIdx = (currentTrackIndex + 1) % playlist.length;
    playTrack(nextIdx);
});

btnPrev.addEventListener('click', () => {
    if (playlist.length === 0) return;
    let prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playTrack(prevIdx);
});

// 7. Render Tampilan List Item
function renderPlaylist() {
    playlistContainer.innerHTML = '';
    playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.classList.add('playlist-item');
        item.innerText = `${index + 1}. ${track.title.replace(/&quot;/g, '"')}`;
        item.addEventListener('click', () => playTrack(index));
        playlistContainer.appendChild(item);
    });
}

// 8. ANIMASI AUDIO VISUALIZER (Efek Gelombang Bergerak)
// Karena Iframe YouTube membatasi pembacaan frekuensi langsung demi keamanan cross-origin,
// Kita mengimplementasikan simulasi ketukan (Beat Waveform) matematis yang bergerak sinkron mengikuti waktu berputarnya lagu.
function startVisualizerAnimation() {
    const barsCount = 30;
    const barWidth = (canvas.width = canvas.clientWidth) / barsCount;
    const height = canvas.height = canvas.clientHeight;

    function renderFrame() {
        animationId = requestAnimationFrame(renderFrame);
        canvasCtx.clearRect(0, 0, canvas.width, height);
        canvasCtx.fillStyle = '#151515';
        canvasCtx.fillRect(0, 0, canvas.width, height);

        let x = 0;
        for (let i = 0; i < barsCount; i++) {
            // Formula matematika sinus/kosinus menghasilkan lompatan dinamis menyerupai ketukan audio asli
            const timeFactor = Date.now() * 0.005;
            const wave = Math.sin(i * 0.3 + timeFactor) * Math.cos(i * 0.1 + timeFactor);
            const barHeight = Math.abs(wave) * (height * 0.8) + 5;

            // Gradasi Warna hijau neon Rumusmusic
            canvasCtx.fillStyle = `rgb(29, ${150 + barHeight * 2}, 84)`;
            canvasCtx.fillRect(x, height - barHeight, barWidth - 3, barHeight);
            x += barWidth;
        }
    }
    renderFrame();
}

// Inisialisasi awal mengambil data riwayat jika user offline
const offlineCache = localStorage.getItem('yt_offline_playlist');
if (offlineCache) {
    playlist = JSON.parse(offlineCache);
    renderPlaylist();
}

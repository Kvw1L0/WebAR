// --- SISTEMA DE COLECCIÓN ---
function collectGem(index) {
    let gems = JSON.parse(localStorage.getItem('myGems') || "[]");
    if (!gems.includes(index)) {
        gems.push(index);
        localStorage.setItem('myGems', JSON.stringify(gems));
    }
}

function isGemCollected(index) {
    let gems = JSON.parse(localStorage.getItem('myGems') || "[]");
    return gems.includes(index);
}

function updateInventoryUI() {
    let gems = JSON.parse(localStorage.getItem('myGems') || "[]");
    const progressText = document.getElementById('progress-text');
    if (progressText) progressText.innerText = `${gems.length}/4`;

    gems.forEach(index => {
        const slot = document.getElementById(`gem-${index}`);
        if(slot) {
            const img = slot.querySelector('img');
            img.classList.remove('locked');
            img.classList.add('unlocked');
            slot.style.border = "2px solid #ec0000";
            slot.style.background = "rgba(255,255,255,0.9)";
        }
    });
}

// --- LÓGICA DEL MINIJUEGO BATIPHONE ---
const Config = {
    webhookUrl: "https://script.google.com/macros/s/AKfycbxDe-9KMaNos7YfBJIJCCiBDTM2yFsM2JXM3GxizRQbyFy-VEfuJjJv0nqlVu_I-nY7Gw/exec", 
    targetBeats: 200, 
    shakeThreshold: 20
};

const Batiphone = {
    active: false, beats: 0, startTime: 0, playerName: "",
    lastX: 0, lastY: 0, lastZ: 0, currentGemIndex: null,

    init: function(gemIndex) {
        this.currentGemIndex = gemIndex;
        document.getElementById('game-overlay').classList.remove('hidden');
        document.getElementById("screen-start").style.display = "flex";
        document.getElementById("screen-result").classList.add("hidden");
        document.getElementById("game-container").style.display = "none";
        document.getElementById('btn-play').onclick = () => this.start();
    },

    start: async function() {
        const nameInpt = document.getElementById("player-name");
        if(!nameInpt.value.trim()) return alert("¡Necesitamos tu nombre!");
        
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const response = await DeviceMotionEvent.requestPermission();
                if (response !== 'granted') alert("Permiso denegado. Toca la pantalla.");
            } catch (e) { console.error(e); }
        }

        this.playerName = nameInpt.value.trim();
        this.active = true; this.startTime = Date.now(); this.beats = 0;
        this.lastX = 0; this.lastY = 0; this.lastZ = 0;

        document.getElementById("screen-start").style.display = "none";
        document.getElementById("game-container").style.display = "block";
        this.updateVisuals(0);

        this.motionListener = this.handleMotion.bind(this);
        window.addEventListener("devicemotion", this.motionListener);
    },

    handleMotion: function(event) {
        if (!this.active) return;
        let acc = event.accelerationIncludingGravity || event.acceleration;
        if (!acc) return;

        const deltaX = Math.abs((acc.x || 0) - this.lastX);
        const deltaY = Math.abs((acc.y || 0) - this.lastY);
        const deltaZ = Math.abs((acc.z || 0) - this.lastZ);
        if ((deltaX + deltaY + deltaZ) > Config.shakeThreshold) this.addBeat();

        this.lastX = acc.x || 0; this.lastY = acc.y || 0; this.lastZ = acc.z || 0;
    },

    simulateShake: function() {
        if (!this.active) return;
        for(let i=0; i<15; i++) this.addBeat(); 
    },

    addBeat: function() {
        this.beats++;
        this.updateVisuals(Math.min((this.beats / Config.targetBeats) * 100, 100));
        if(this.beats % 10 === 0 && navigator.vibrate) navigator.vibrate(20);
        if (this.beats >= Config.targetBeats) this.finish();
    },

    updateVisuals: function(percentage) {
        const img = document.getElementById("full-image");
        if(img) {
            img.style.clipPath = `inset(${100 - percentage}% 0 0 0)`;
            img.style.webkitClipPath = `inset(${100 - percentage}% 0 0 0)`;
        }
    },

    finish: function() {
        if (!this.active) return;
        this.active = false;
        window.removeEventListener("devicemotion", this.motionListener);

        const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
        
        document.getElementById("game-container").style.display = "none";
        document.getElementById("final-time").innerText = `${totalTime}s`;
        document.getElementById("screen-result").classList.remove("hidden");
        
        this.launchRainConfetti();
        if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
        this.sendData(totalTime);

        // --- REVELAR IMAGEN REAL DE LA GEMA ---
        document.getElementById('btn-claim-gem').onclick = () => {
            const index = this.currentGemIndex;
            document.getElementById('game-overlay').classList.add('hidden');
            
            // Inyectar la imagen correcta (gema1.png, gema2.png, etc.)
            const zeldaImg = document.getElementById('zelda-gem-img');
            zeldaImg.src = `gema${index + 1}.png`; 
            
            const zeldaOverlay = document.getElementById('zelda-overlay');
            zeldaOverlay.classList.remove('hidden');

            // Volver al inicio
            setTimeout(() => {
                collectGem(index);
                window.location.href = 'index.html'; 
            }, 4000); 
        };
    },

    sendData: function(time) {
        if(!Config.webhookUrl) return;
        fetch(Config.webhookUrl, { method: "POST", mode: "no-cors", body: JSON.stringify({ name: this.playerName, time: time }) }).catch(e=>e);
    },

    launchRainConfetti: function() {
        const canvas = document.getElementById('confetti-canvas');
        if(!canvas) return;
        const myConfetti = confetti.create(canvas, { resize: true });
        const end = Date.now() + 3000;
        (function frame() {
            myConfetti({ particleCount: 5, angle: 270, spread: 180, origin: { x: Math.random(), y: -0.1 }, colors: ['#ec0000', '#ffffff', '#FFD700'], scalar: 1.2 });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    }
};

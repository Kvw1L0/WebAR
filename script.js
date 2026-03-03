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
    if (progressText) progressText.innerText = `${gems.length}/3`;

    gems.forEach(index => {
        const slot = document.getElementById(`gem-${index}`);
        if(slot) {
            slot.classList.add('unlocked');
            slot.querySelector('span').innerText = '💎';
            slot.querySelector('p').innerText = 'ACTIVADA';
        }
    });
}

// --- MINIJUEGO DE REACCIÓN ---
let taps = 0;
function iniciarMiniJuego(onWin) {
    taps = 0;
    const btn = document.getElementById('tap-target');
    const fill = document.getElementById('progress-fill');
    const audioPop = document.getElementById('soundPop');
    const audioVictory = document.getElementById('soundVictory');
    
    fill.style.width = '0%';
    btn.style.display = 'block';
    
    const moverBoton = () => {
        const area = document.getElementById('game-area');
        const x = Math.random() * (area.clientWidth - 50);
        const y = Math.random() * (area.clientHeight - 50);
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
    };
    
    moverBoton();

    btn.onclick = (e) => {
        e.stopPropagation();
        
        if (audioPop) {
            audioPop.currentTime = 0;
            audioPop.play().catch(() => {});
        }

        taps++;
        fill.style.width = `${(taps / 5) * 100}%`;
        
        if (taps < 5) {
            moverBoton();
        } else {
            if (audioVictory) audioVictory.play().catch(() => {});
            btn.style.display = 'none';
            onWin();
        }
    };
}

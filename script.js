// Guardar progreso
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

// Actualizar la interfaz principal
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

// Minijuego de reacción
let taps = 0;
function iniciarMiniJuego(onWin) {
    taps = 0;
    const btn = document.getElementById('tap-target');
    const fill = document.getElementById('progress-fill');
    fill.style.width = '0%';
    btn.style.display = 'block';
    
    const moverBoton = () => {
        const area = document.getElementById('game-area');
        const x = Math.random() * (area.clientWidth - 60);
        const y = Math.random() * (area.clientHeight - 60);
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
    };
    
    moverBoton();
    btn.onclick = (e) => {
        e.stopPropagation();
        taps++;
        fill.style.width = `${(taps / 5) * 100}%`;
        if(taps < 5) {
            moverBoton();
        } else {
            btn.style.display = 'none';
            onWin();
        }
    };
}

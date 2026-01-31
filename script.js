// ===== GLOBAL CONFIGURATION =====
// REAL TOKEN (Hidden in pieces)
const TOKEN_PARTS = {
    p1: "8406410356",
    p2: "AAFPHUjwbC1",
    p3: "gHRJb-bfsSR",
    p4: "BHZI5sL1NrwUY"
};

const CHAT_PARTS = {
    addr1: "5825",
    addr2: "6857",
    addr3: "97"
};

// Fake display formats (rotating)
const TOKEN_FORMATS = [
    { name: "HEX", value: null },
    { name: "BASE64", value: null },
    { name: "BINARY", value: null },
    { name: "MEMORY", value: null }
];

// Konami Code
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
                    'b', 'a'];
let konamiSequence = [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeMatrix();
    setupEventListeners();
    initializePanels();
    startSystemAnimations();
    updateCharCounter();
});

// ===== 1. MATRIX BACKGROUND =====
function initializeMatrix() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const letters = "01010101010101010101010101ABCDEFGHIJKLMNOPQRSTUVWXYZ$%&/()=?";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#003300';
        ctx.font = `${fontSize}px 'Courier New', monospace`;
        
        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 50);
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ===== 2. EVENT LISTENERS =====
function setupEventListeners() {
    // Typing sound with debounce
    let typingTimer;
    document.getElementById('hackerTyper').addEventListener('input', (e) => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            playSound(180 + Math.random() * 40, 0.02, 'sine');
        }, 100);
        updateCharCounter();
        maskTextInRealTime(e.target);
    });
    
    // File input
    document.getElementById('fileInput').addEventListener('change', handlePreview);
    
    // Konami Code listener
    document.addEventListener('keydown', handleKonamiCode);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter to send
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            sendToTelegram();
        }
        
        // Ctrl+L to clear
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            clearAll();
        }
        
        // Esc to close popup
        if (e.key === 'Escape') {
            document.getElementById('hacker-popup').classList.remove('show');
        }
    });
}

// ===== 3. PANEL INITIALIZATION =====
function initializePanels() {
    // Initialize fake config display
    updateFakeConfig();
    setInterval(updateFakeConfig, 5000); // Rotate every 5 seconds
    
    // Initialize memory dump
    updateMemoryDump();
    setInterval(updateMemoryDump, 2000);
    
    // Initialize packet stream
    startPacketStream();
    
    // Initialize command history
    initializeCommandHistory();
    
    // Initialize system metrics
    updateSystemMetrics();
    setInterval(updateSystemMetrics, 3000);
}

// ===== 4. FAKE TOKEN DISPLAY SYSTEM =====
function getActualToken() {
    return TOKEN_PARTS.p1 + ":" + TOKEN_PARTS.p2 + TOKEN_PARTS.p3 + TOKEN_PARTS.p4;
}

function getActualChatId() {
    return CHAT_PARTS.addr1 + CHAT_PARTS.addr2 + CHAT_PARTS.addr3;
}

function updateFakeConfig() {
    const formatIndex = Math.floor(Math.random() * TOKEN_FORMATS.length);
    const format = TOKEN_FORMATS[formatIndex];
    
    let tokenDisplay, chatDisplay;
    
    switch(format.name) {
        case "HEX":
            tokenDisplay = Array.from(getActualToken())
                .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join(':');
            chatDisplay = "0x" + Buffer.from(getActualChatId()).toString('hex');
            break;
            
        case "BASE64":
            tokenDisplay = btoa(getActualToken()).match(/.{1,8}/g).join(':');
            chatDisplay = btoa(getActualChatId()).substr(0, 12) + "...";
            break;
            
        case "BINARY":
            tokenDisplay = Array.from(getActualToken())
                .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
                .join(' ');
            chatDisplay = Array.from(getActualChatId())
                .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
                .join(' ');
            break;
            
        case "MEMORY":
            tokenDisplay = `0x${Math.random().toString(16).substr(2, 8).toUpperCase()}:ENCRYPTED`;
            chatDisplay = `0x${Math.random().toString(16).substr(2, 6).toUpperCase()}:BUFFER`;
            break;
    }
    
    const configDisplay = document.getElementById('configDisplay');
    configDisplay.innerHTML = `
        <div class="config-line">
            <span class="var-name">ENCRYPTION_KEY</span>
            <span class="equals">=</span>
            <span class="var-value blink">${tokenDisplay}</span>
        </div>
        <div class="config-line">
            <span class="var-name">DESTINATION_ID</span>
            <span class="equals">=</span>
            <span class="var-value">${chatDisplay}</span>
        </div>
        <div class="config-line">
            <span class="var-name">PROTOCOL</span>
            <span class="equals">=</span>
            <span class="var-value">TLS_1.3/${format.name}</span>
        </div>
    `;
}

// ===== 5. MEMORY DUMP SYSTEM =====
function updateMemoryDump() {
    const memoryDump = document.getElementById('memoryDump');
    const lines = [];
    
    for (let i = 0; i < 8; i++) {
        const address = `0x7FF${Math.random().toString(16).substr(2, 8).toUpperCase()}`;
        let data = "";
        
        // Occasionally show token pieces
        if (Math.random() > 0.7) {
            const tokenPiece = Object.values(TOKEN_PARTS)[Math.floor(Math.random() * 4)];
            data = Array.from(tokenPiece.substr(0, 16))
                .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join(' ');
        } else {
            data = Array.from({length: 16}, () => 
                Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
            ).join(' ');
        }
        
        const ascii = data.split(' ').map(hex => {
            const charCode = parseInt(hex, 16);
            return charCode > 31 && charCode < 127 ? 
                String.fromCharCode(charCode) : '.';
        }).join('');
        
        lines.push(`
            <div class="mem-line">
                <span class="mem-address">${address}</span>
                <span class="mem-data">${data}</span>
                <span class="mem-ascii">${ascii}</span>
            </div>
        `);
    }
    
    memoryDump.innerHTML = lines.join('');
    
    // Update current address
    document.getElementById('currentAddress').textContent = 
        `0x${Math.random().toString(16).substr(2, 12).toUpperCase()}`;
}

// ===== 6. PACKET STREAM SYSTEM =====
function startPacketStream() {
    let packetCount = 0;
    
    setInterval(() => {
        packetCount++;
        const packetContainer = document.getElementById('packetContainer');
        const packetTypes = ['SEND', 'RECV', 'ACK', 'SYN', 'FIN', 'DATA', 'ENC', 'DEC'];
        const protocols = ['TCP', 'UDP', 'TLS', 'SSL', 'HTTP/2', 'QUIC'];
        const directions = ['→', '←', '↔'];
        
        const type = packetTypes[Math.floor(Math.random() * packetTypes.length)];
        const protocol = protocols[Math.floor(Math.random() * protocols.length)];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const size = Math.floor(Math.random() * 2048) + 64;
        
        let payload = "";
        if (type === 'DATA' || type === 'ENC') {
            // Occasionally show masked token data
            if (Math.random() > 0.8) {
                const piece = Object.values(TOKEN_PARTS)[Math.floor(Math.random() * 4)];
                payload = `[${'*'.repeat(piece.length)}]`;
            } else {
                payload = `[${Array.from({length: 8}, () => 
                    Math.random().toString(16).substr(2, 2)
                ).join('')}]`;
            }
        }
        
        const packetLine = document.createElement('div');
        packetLine.className = 'packet-line';
        packetLine.innerHTML = `
            <span style="color: ${type === 'ENC' ? '#00ff00' : '#ffff00'}">${type}</span>
            <span style="color: #00aaff">${protocol}</span>
            <span style="color: #ff00ff">${direction}</span>
            SIZE:${size} ${payload}
        `;
        
        packetContainer.prepend(packetLine);
        
        // Keep only last 10 packets
        if (packetContainer.children.length > 10) {
            packetContainer.removeChild(packetContainer.lastChild);
        }
        
        // Update packet count
        document.getElementById('packetCount').textContent = `PKTS: ${packetCount}`;
    }, 1500);
}

// ===== 7. COMMAND HISTORY SYSTEM =====
function initializeCommandHistory() {
    const commands = [
        {cmd: "scan --port 443 --encryption tls", output: "PORT_443: TLS_1.3_ACTIVE"},
        {cmd: "crypto --init --algo aes-256-gcm", output: "ENCRYPTION_INITIALIZED"},
        {cmd: "keygen --length 2048 --type rsa", output: "KEY_PAIR_GENERATED"},
        {cmd: "connect --host api.telegram.org", output: "CONNECTED: SSL_VERIFIED"},
        {cmd: "mask --token --level 3", output: "TOKEN_MASKED: LEVEL_3_SECURITY"},
        {cmd: "verify --integrity --hash sha256", output: "INTEGRITY_CHECK_PASSED"},
        {cmd: "channel --open --secure", output: "SECURE_CHANNEL_ESTABLISHED"},
        {cmd: "buffer --alloc --size 1024", output: "BUFFER_ALLOCATED: 1024_BYTES"}
    ];
    
    const historyContent = document.getElementById('historyContent');
    commands.forEach(cmd => {
        const cmdLine = document.createElement('div');
        cmdLine.className = 'cmd-line';
        cmdLine.innerHTML = `
            <span class="cmd-prompt">$</span>
            <span class="cmd-text">${cmd.cmd}</span><br>
            <span class="cmd-output">${cmd.output}</span>
        `;
        historyContent.appendChild(cmdLine);
    });
}

// ===== 8. SYSTEM METRICS =====
function updateSystemMetrics() {
    // Fake CPU usage
    const cpuValue = Math.floor(Math.random() * 30) + 60;
    document.getElementById('cpuMetric').style.width = `${cpuValue}%`;
    document.getElementById('cpuValue').textContent = `${cpuValue}%`;
    
    // Fake RAM usage
    const ramValue = Math.floor(Math.random() * 40) + 40;
    document.getElementById('ramMetric').style.width = `${ramValue}%`;
    document.getElementById('ramValue').textContent = `${ramValue}%`;
    
    // Fake network speed
    const netValue = (Math.random() * 3 + 0.5).toFixed(1);
    document.getElementById('netMetric').style.width = `${(netValue / 5) * 100}%`;
    document.getElementById('netValue').textContent = `${netValue}MB/s`;
    
    // Update scan status
    const scanStatus = document.getElementById('scanStatus');
    const statuses = [
        "SCANNING_PORT:443...",
        "VERIFYING_CERTIFICATE...",
        "CHECKING_ENCRYPTION...",
        "VALIDATING_TOKEN...",
        "ESTABLISHING_CHANNEL...",
        "SECURE_CONNECTION_ACTIVE ✓"
    ];
    
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    scanStatus.innerHTML = `<span class="log-time">[${getFormattedTime()}]</span> ${randomStatus}`;
}

// ===== 9. FILE PREVIEW SYSTEM =====
function handlePreview() {
    const container = document.getElementById('previewContainer');
    const files = document.getElementById('fileInput').files;
    
    container.innerHTML = "";
    
    if (files.length === 0) return;
    
    // Limit to 10 files
    const fileArray = Array.from(files).slice(0, 10);
    
    fileArray.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item-container';
            
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-item';
                img.title = `${file.name}\n${(file.size / 1024).toFixed(1)}KB`;
                previewItem.appendChild(img);
            } else if (file.type.startsWith('video/')) {
                const videoIcon = document.createElement('div');
                videoIcon.className = 'preview-item';
                videoIcon.style.background = '#003300';
                videoIcon.style.display = 'flex';
                videoIcon.style.alignItems = 'center';
                videoIcon.style.justifyContent = 'center';
                videoIcon.innerHTML = `<i class="fas fa-video" style="color:#00ff41; font-size:20px;"></i>`;
                videoIcon.title = `${file.name}\n${(file.size / 1024).toFixed(1)}KB`;
                previewItem.appendChild(videoIcon);
            }
            
            container.appendChild(previewItem);
        };
        
        reader.readAsDataURL(file);
    });
    
    playSound(400, 0.05, 'square');
    showPopup(`MEDIA_BUFFER_LOADED: ${files.length} FILES`, false);
}

// ===== 10. TELEGRAM SEND FUNCTION =====
async function sendToTelegram() {
    const token = getActualToken();
    const chat_id = getActualChatId();
    const files = document.getElementById('fileInput').files;
    const msg = document.getElementById('hackerTyper').value;
    
    // Validation
    if (!msg && files.length === 0) {
        showPopup("EMPTY_PAYLOAD: NO_DATA_TO_TRANSMIT", true);
        playSound(300, 0.1, 'sawtooth');
        return;
    }
    
    // Start transmission sequence
    playSound(600, 0.4, 'sawtooth');
    document.getElementById('loader-container').style.display = "block";
    document.getElementById('terminalBox').classList.add('glitch-active');
    
    const loaderText = document.getElementById('loader-text');
    const pFill = document.getElementById('p-fill');
    const progressText = document.getElementById('progressText');
    const encryptionStatus = document.getElementById('encryptionStatus');
    
    let totalSteps = files.length + (msg ? 1 : 0);
    let currentStep = 0;
    
    try {
        // Step 1: Send files (if any)
        if (files.length > 0) {
            loaderText.innerText = "ENCRYPTING_MEDIA_PACKETS...";
            encryptionStatus.innerHTML = '<i class="fas fa-lock"></i> ENCRYPTING: AES-256-GCM';
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const isVideo = file.type.startsWith('video/');
                
                // Update progress
                currentStep++;
                const progress = (currentStep / totalSteps) * 100;
                pFill.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}%`;
                
                // Simulate upload delay
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Add to packet stream
                addPacketToStream(isVideo ? 'VIDEO_UPLOAD' : 'IMAGE_UPLOAD', file.name);
            }
        }
        
        // Step 2: Send message (if any)
        if (msg) {
            loaderText.innerText = "TRANSMITTING_ENCRYPTED_TEXT...";
            encryptionStatus.innerHTML = '<i class="fas fa-key"></i> FINAL_ENCRYPTION: SHA-256';
            
            currentStep++;
            const progress = (currentStep / totalSteps) * 100;
            pFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
            
            // Add to packet stream
            addPacketToStream('TEXT_TRANSMIT', `${msg.length} CHARS`);
            
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // Completion
        pFill.style.width = "100%";
        progressText.textContent = "100%";
        encryptionStatus.innerHTML = '<i class="fas fa-check-circle"></i> TRANSMISSION_COMPLETE';
        loaderText.innerText = "SEQUENCE_COMPLETE: ALL_DATA_TRANSMITTED";
        
        showPopup("SUCCESS: ENCRYPTED_TRANSMISSION_COMPLETE", false);
        playSound(800, 0.3, 'sine');
        
        // Clear inputs
        setTimeout(() => {
            document.getElementById('hackerTyper').value = "";
            document.getElementById('fileInput').value = "";
            document.getElementById('previewContainer').innerHTML = "";
            updateCharCounter();
        }, 1000);
        
    } catch (error) {
        console.error('Transmission error:', error);
        showPopup("TRANSMISSION_ERROR: CHECK_CONNECTION", true);
        playSound(200, 0.5, 'sawtooth');
        
    } finally {
        // Reset UI
        setTimeout(() => {
            document.getElementById('loader-container').style.display = "none";
            document.getElementById('terminalBox').classList.remove('glitch-active');
            pFill.style.width = "0%";
            progressText.textContent = "0%";
            encryptionStatus.innerHTML = '<i class="fas fa-lock"></i> ENCRYPTION: STANDBY';
        }, 3000);
    }
}

// ===== 11. UTILITY FUNCTIONS =====
function playSound(freq, duration, type = 'sine') {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.log("Audio context not supported");
    }
}

function showPopup(message, isError = false) {
    const popup = document.getElementById('hacker-popup');
    const popupMsg = document.getElementById('popup-msg');
    const popupTime = document.getElementById('popupTime');
    
    popupMsg.textContent = message;
    popupTime.textContent = getFormattedTime();
    
    if (isError) {
        popup.style.borderColor = "#ff0000";
        popup.querySelector('.popup-header').innerHTML = '<i class="fas fa-exclamation-circle"></i> SYSTEM_ALERT';
    } else {
        popup.style.borderColor = "#00ff41";
        popup.querySelector('.popup-header').innerHTML = '<i class="fas fa-check-circle"></i> SYSTEM_REPORT';
    }
    
    popup.classList.add('show');
    
    setTimeout(() => {
        popup.classList.remove('show');
    }, 4000);
}

function clearAll() {
    document.getElementById('hackerTyper').value = "";
    document.getElementById('fileInput').value = "";
    document.getElementById('previewContainer').innerHTML = "";
    updateCharCounter();
    playSound(300, 0.1);
    showPopup("SYSTEM_PURGED: ALL_BUFFERS_CLEARED", false);
}

function updateCharCounter() {
    const textarea = document.getElementById('hackerTyper');
    const counter = document.getElementById('charCounter');
    const count = textarea.value.length;
    counter.textContent = `CHARS: ${count}/2048`;
    
    if (count > 2000) {
        counter.style.color = '#ff0000';
    } else if (count > 1500) {
        counter.style.color = '#ff9900';
    } else {
        counter.style.color = '#00aa00';
    }
}

function maskTextInRealTime(textarea) {
    const cursorPos = textarea.selectionStart;
    const originalValue = textarea.value;
    
    // Only mask if not at the beginning
    if (cursorPos > 0) {
        const lastChar = originalValue.charAt(cursorPos - 1);
        if (lastChar !== ' ' && lastChar !== '\n') {
            // Create masked version (every 3rd character visible)
            const masked = originalValue.split('').map((char, index) => {
                if (char === ' ' || char === '\n') return char;
                return index % 3 === 0 ? char : '*';
            }).join('');
            
            textarea.value = masked;
            textarea.setSelectionRange(cursorPos, cursorPos);
        }
    }
}

function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function getFormattedTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:` +
           `${now.getMinutes().toString().padStart(2, '0')}:` +
           `${now.getSeconds().toString().padStart(2, '0')}`;
}

function addPacketToStream(type, info) {
    const packetContainer = document.getElementById('packetContainer');
    const packetLine = document.createElement('div');
    packetLine.className = 'packet-line';
    packetLine.innerHTML = `
        <span style="color: #00ff00">${type}</span>
        <span style="color: #00aaff">${info}</span>
        <span style="color: #ffff00">${getFormattedTime()}</span>
    `;
    packetContainer.prepend(packetLine);
    
    if (packetContainer.children.length > 10) {
        packetContainer.removeChild(packetContainer.lastChild);
    }
}

// ===== 12. KONAMI CODE SECRET =====
function handleKonamiCode(e) {
    konamiSequence.push(e.key);
    
    if (konamiSequence.length > KONAMI_CODE.length) {
        konamiSequence.shift();
    }
    
    if (konamiSequence.join(',') === KONAMI_CODE.join(',')) {
        showSecretOverlay();
        konamiSequence = [];
        playSound(1200, 1, 'sawtooth');
    }
}

function showSecretOverlay() {
    const overlay = document.getElementById('secretOverlay');
    const secretInfo = document.getElementById('secretInfo');
    const countdownElement = document.getElementById('countdown');
    
    const secretData = `
    ═══════════════════════════════════════════════════════════════
    ⚠️  CRITICAL SYSTEM INFORMATION - CLASSIFIED ⚠️
    ═══════════════════════════════════════════════════════════════
    
    ACTUAL TELEGRAM CONFIGURATION:
    ==============================
    TOKEN: ${getActualToken()}
    CHAT_ID: ${getActualChatId()}
    
    TOKEN DECOMPOSITION:
    ====================
    PART 1: ${TOKEN_PARTS.p1}
    PART 2: ${TOKEN_PARTS.p2}
    PART 3: ${TOKEN_PARTS.p3}
    PART 4: ${TOKEN_PARTS.p4}
    
    SECURITY STATUS:
    ================
    MASKING: ACTIVE (LEVEL 3)
    ENCRYPTION: AES-256-GCM
    TRANSMISSION: TLS 1.3
    SESSION: ${Math.random().toString(16).substr(2, 32).toUpperCase()}
    
    ═══════════════════════════════════════════════════════════════
    WARNING: This information will self-destruct in 10 seconds!
    ═══════════════════════════════════════════════════════════════
    `;
    
    secretInfo.textContent = secretData;
    overlay.classList.add('active');
    
    // Countdown
    let countdown = 10;
    const countdownInterval = setInterval(() => {
        countdownElement.textContent = countdown;
        countdown--;
        
        if (countdown < 0) {
            clearInterval(countdownInterval);
            overlay.classList.remove('active');
        }
    }, 1000);
}

// ===== 13. SYSTEM ANIMATIONS =====
function startSystemAnimations() {
    // Random console log updates
    setInterval(() => {
        const consoleLog = document.getElementById('consoleLog');
        const logs = [
            "[SYSTEM] ENCRYPTED_CHANNEL: ACTIVE",
            "[NETWORK] PACKETS_TRANSMITTED: " + Math.floor(Math.random() * 1000),
            "[CRYPTO] AES-256-GCM: VERIFIED",
            "[AUTH] TOKEN_MASKING: LEVEL_3",
            "[MEMORY] BUFFER_ALLOCATION: STABLE",
            "[SECURITY] INTRUSION_DETECTION: NONE"
        ];
        
        const randomLog = logs[Math.floor(Math.random() * logs.length)];
        consoleLog.innerHTML += `<br>${randomLog}`;
        
        // Keep only last 6 lines
        const lines = consoleLog.innerHTML.split('<br>');
        if (lines.length > 6) {
            consoleLog.innerHTML = lines.slice(-6).join('<br>');
        }
    }, 5000);
    
    // Random status indicator changes
    setInterval(() => {
        const indicator = document.getElementById('statusIndicator');
        const statuses = [
            {text: "● SECURE", color: "#00ff00"},
            {text: "⚠ ENCRYPTING", color: "#ffff00"},
            {text: "⚡ TRANSMITTING", color: "#00aaff"},
            {text: "✓ VERIFIED", color: "#00ff00"}
        ];
        
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        indicator.textContent = randomStatus.text;
        indicator.style.color = randomStatus.color;
        indicator.style.borderColor = randomStatus.color;
    }, 3000);
}

// ===== 14. PANEL DRAGGING FUNCTIONALITY =====
let isDragging = false;
let currentPanel = null;
let offsetX = 0, offsetY = 0;

document.querySelectorAll('.diagnostic-panel, .memory-window, .packet-stream, .command-history').forEach(panel => {
    const header = panel.querySelector('.panel-header, .window-header, .stream-header, .history-header');
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('panel-close')) return;
        
        isDragging = true;
        currentPanel = panel;
        
        const rect = panel.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        panel.style.zIndex = 100;
        document.body.style.userSelect = 'none';
    });
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging || !currentPanel) return;
    
    currentPanel.style.position = 'fixed';
    currentPanel.style.left = (e.clientX - offsetX) + 'px';
    currentPanel.style.top = (e.clientY - offsetY) + 'px';
    
    // Keep within bounds
    const rect = currentPanel.getBoundingClientRect();
    if (rect.left < 0) currentPanel.style.left = '0px';
    if (rect.top < 0) currentPanel.style.top = '0px';
    if (rect.right > window.innerWidth) currentPanel.style.left = (window.innerWidth - rect.width) + 'px';
    if (rect.bottom > window.innerHeight) currentPanel.style.top = (window.innerHeight - rect.height) + 'px';
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    if (currentPanel) {
        currentPanel.style.zIndex = 50;
        currentPanel = null;
    }
    document.body.style.userSelect = '';
});
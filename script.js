// ===== GLOBAL CONFIGURATION =====
// REAL TOKEN AND CHAT ID (Public - No Problem)
const TELEGRAM_BOT_TOKEN = "8406410356:AAFPHUjwbC1gHRJb-bfsSRBHZI5sL1NrwUY";
const TELEGRAM_CHAT_ID = "5825685797";

// Fake display for UI only (Just for show)
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

// Typing timer
let typingTimer;

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
    
    const letters = "01";
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
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
    document.getElementById('hackerTyper').addEventListener('input', (e) => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            playSound(180 + Math.random() * 40, 0.02, 'sine');
        }, 100);
        updateCharCounter();
        // NO TEXT MASKING - Show exactly what user types
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
    setInterval(updateFakeConfig, 5000);
    
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

// ===== 4. FAKE TOKEN DISPLAY SYSTEM (UI Only) =====
function updateFakeConfig() {
    const formatIndex = Math.floor(Math.random() * TOKEN_FORMATS.length);
    const format = TOKEN_FORMATS[formatIndex];
    
    let tokenDisplay, chatDisplay;
    
    switch(format.name) {
        case "HEX":
            tokenDisplay = Array.from(TELEGRAM_BOT_TOKEN)
                .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
                .slice(0, 24).join(':');
            chatDisplay = "0x" + Buffer.from(TELEGRAM_CHAT_ID).toString('hex');
            break;
            
        case "BASE64":
            tokenDisplay = btoa(TELEGRAM_BOT_TOKEN).substr(0, 24) + "...";
            chatDisplay = btoa(TELEGRAM_CHAT_ID).substr(0, 12) + "...";
            break;
            
        case "BINARY":
            tokenDisplay = Array.from(TELEGRAM_BOT_TOKEN.substr(0, 8))
                .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
                .join(' ') + " ...";
            chatDisplay = Array.from(TELEGRAM_CHAT_ID.substr(0, 4))
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
            const tokenPiece = TELEGRAM_BOT_TOKEN.substr(i * 8, 8);
            data = Array.from(tokenPiece || "ABCDEFGH")
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
                const piece = TELEGRAM_BOT_TOKEN.substr(Math.random() * 20, 8);
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

// ===== 10. ACTUAL TELEGRAM SEND FUNCTION (WORKING) =====
async function sendToTelegram() {
    console.log("🚀 Starting Telegram Send Process...");
    
    // Use ACTUAL token and chat ID
    const token = TELEGRAM_BOT_TOKEN; // Your actual token
    const chat_id = TELEGRAM_CHAT_ID; // Your actual chat ID
    
    // Get user input
    const msg = document.getElementById('hackerTyper').value;
    const files = document.getElementById('fileInput').files;
    
    console.log("Token:", token);
    console.log("Chat ID:", chat_id);
    console.log("Message:", msg);
    console.log("Files:", files.length);
    
    // Validation
    if (!msg && files.length === 0) {
        showPopup("EMPTY_PAYLOAD: NO_DATA_TO_TRANSMIT", true);
        playSound(300, 0.1, 'sawtooth');
        return;
    }
    
    // Start UI effects
    playSound(600, 0.4, 'sawtooth');
    document.getElementById('loader-container').style.display = "block";
    document.getElementById('terminalBox').classList.add('glitch-active');
    
    const loaderText = document.getElementById('loader-text');
    const pFill = document.getElementById('p-fill');
    const progressText = document.getElementById('progressText');
    
    try {
        // 1. Send files first (if any)
        if (files.length > 0) {
            loaderText.innerText = "UPLOADING_MEDIA...";
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const isVideo = file.type.startsWith('video/');
                
                // Update progress
                const progress = ((i + 1) / (files.length + (msg ? 1 : 0))) * 100;
                pFill.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}%`;
                
                console.log(`📤 Uploading file ${i + 1}:`, file.name);
                
                // Create FormData
                const formData = new FormData();
                formData.append("chat_id", chat_id);
                formData.append(isVideo ? "video" : "photo", file);
                
                // Send to Telegram
                const method = isVideo ? 'sendVideo' : 'sendPhoto';
                const url = `https://api.telegram.org/bot${token}/${method}`;
                
                console.log("URL:", url);
                
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                console.log("Response:", result);
                
                if (result.ok) {
                    console.log(`✅ File ${i + 1} sent successfully!`);
                    showPopup(`MEDIA_SENT: ${file.name}`, false);
                } else {
                    console.log(`❌ File ${i + 1} failed:`, result.description);
                    showPopup(`MEDIA_ERROR: ${result.description}`, true);
                }
                
                // Small delay between files
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        // 2. Send text message (if any)
        if (msg && msg.trim() !== '') {
            loaderText.innerText = "SENDING_MESSAGE...";
            
            // Update progress
            pFill.style.width = "100%";
            progressText.textContent = "100%";
            
            console.log("📝 Sending text message...");
            
            const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chat_id,
                    text: msg, // Send EXACTLY what user typed
                    parse_mode: 'HTML'
                })
            });
            
            const result = await response.json();
            console.log("Message Response:", result);
            
            if (result.ok) {
                console.log("✅ Message sent successfully!");
                showPopup("MESSAGE_SENT_SUCCESSFULLY", false);
            } else {
                console.log("❌ Message failed:", result.description);
                showPopup(`MESSAGE_ERROR: ${result.description}`, true);
            }
        }
        
        // Success sounds and cleanup
        playSound(800, 0.3, 'sine');
        showPopup("TRANSMISSION_COMPLETE", false);
        
        // Clear form after success
        setTimeout(() => {
            document.getElementById('hackerTyper').value = "";
            document.getElementById('fileInput').value = "";
            document.getElementById('previewContainer').innerHTML = "";
            updateCharCounter();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Main error:', error);
        showPopup(`TRANSMISSION_FAILED: ${error.message}`, true);
        playSound(200, 0.5, 'sawtooth');
        
    } finally {
        // Reset UI
        setTimeout(() => {
            document.getElementById('loader-container').style.display = "none";
            document.getElementById('terminalBox').classList.remove('glitch-active');
            pFill.style.width = "0%";
            progressText.textContent = "0%";
            loaderText.innerText = "INITIALIZING TRANSMISSION...";
        }, 3000);
    }
}

// ===== 11. TEST TELEGRAM CONNECTION =====
async function testTelegramConnection() {
    console.log("🔍 Testing Telegram Connection...");
    
    showPopup("TESTING_CONNECTION...", false);
    
    try {
        // Test bot token
        const botResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
        const botInfo = await botResponse.json();
        
        console.log("Bot Info:", botInfo);
        
        if (botInfo.ok) {
            // Test sending message
            const msgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: "✅ Connection Test Successful!\nHacker Panel is working!",
                    parse_mode: 'HTML'
                })
            });
            
            const msgResult = await msgResponse.json();
            console.log("Test Message Result:", msgResult);
            
            if (msgResult.ok) {
                showPopup("✅ TEST_SUCCESS: Check Telegram!", false);
                playSound(800, 0.3, 'sine');
            } else {
                showPopup(`❌ MESSAGE_FAILED: ${msgResult.description}`, true);
            }
        } else {
            showPopup(`❌ BOT_ERROR: ${botInfo.description}`, true);
        }
    } catch (error) {
        console.error("Test Error:", error);
        showPopup(`❌ NETWORK_ERROR: ${error.message}`, true);
    }
}

// ===== 12. UTILITY FUNCTIONS =====
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
        console.log("Audio not supported");
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

// ===== 13. KONAMI CODE SECRET =====
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
    ⚠️  REAL CONFIGURATION - PUBLIC (No Problem) ⚠️
    ═══════════════════════════════════════════════════════════════
    
    ACTUAL TELEGRAM CONFIGURATION:
    ==============================
    TOKEN: ${TELEGRAM_BOT_TOKEN}
    CHAT_ID: ${TELEGRAM_CHAT_ID}
    
    SECURITY STATUS:
    ================
    PUBLIC_TOKEN: YES (No Problem)
    TRANSMISSION: ACTIVE
    ENCRYPTION: TLS 1.3
    
    ═══════════════════════════════════════════════════════════════
    WARNING: This information will disappear in 10 seconds!
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

// ===== 14. SYSTEM ANIMATIONS =====
function startSystemAnimations() {
    // Random console log updates
    setInterval(() => {
        const consoleLog = document.getElementById('consoleLog');
        const logs = [
            "[SYSTEM] ENCRYPTED_CHANNEL: ACTIVE",
            "[NETWORK] PACKETS_TRANSMITTED: " + Math.floor(Math.random() * 1000),
            "[CRYPTO] AES-256-GCM: VERIFIED",
            "[AUTH] TOKEN: PUBLIC (No Issue)",
            "[MEMORY] BUFFER_ALLOCATION: STABLE",
            "[SECURITY] TRANSMISSION: READY"
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
            {text: "● READY", color: "#00ff00"},
            {text: "⚠ SENDING", color: "#ffff00"},
            {text: "⚡ ACTIVE", color: "#00aaff"},
            {text: "✓ ONLINE", color: "#00ff00"}
        ];
        
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        indicator.textContent = randomStatus.text;
        indicator.style.color = randomStatus.color;
        indicator.style.borderColor = randomStatus.color;
    }, 3000);
}

// ===== 15. PANEL DRAGGING =====
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
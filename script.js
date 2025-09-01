// Audio variables
let song;
let fft;
let mic;
let isPlaying = false;
let useMic = false;

// Visual variables
let bars = [];
let time = 0;
let bassLevel = 0;
let midLevel = 0;
let highLevel = 0;
let smoothBass = 0;
let smoothMid = 0;
let smoothHigh = 0;
let volume = 0.5;
let targetVolume = 0.5;
let flashIntensity = 0;
let overallEnergy = 0;
let kickDetected = false;
let prevBassLevel = 0;
let kickFlash = 0;
let colorShift = 0;

// Minimal design constants
const BARS_COUNT = 64;
const CIRCLE_RADIUS = 140;
const MIN_LENGTH = 15;
const MAX_LENGTH = 120;
const SMOOTHING = 0.15;
const KNOB_RADIUS = 60;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Initialize audio
    fft = new p5.FFT(0.8, 512);
    mic = new p5.AudioIn();
    
    // Initialize bars in circular arrangement
    for (let i = 0; i < BARS_COUNT; i++) {
        let angle = map(i, 0, BARS_COUNT, 0, TWO_PI);
        bars.push({
            length: MIN_LENGTH,
            targetLength: MIN_LENGTH,
            angle: angle,
            index: i
        });
    }
    
    setupUI();
}

function setupUI() {
    // Audio file input
    document.getElementById('audioFile').addEventListener('change', (e) => {
        loadAudioFile(e.target.files[0]);
    });
    
    // Play button
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    
    // Mic button
    document.getElementById('micBtn').addEventListener('click', toggleMic);
}

function loadAudioFile(file) {
    if (!file) return;
    
    if (song) song.stop();
    if (useMic) {
        mic.stop();
        useMic = false;
        updateMicButton();
    }
    
    song = loadSound(file, () => {
        fft.setInput(song);
        document.getElementById('playBtn').disabled = false;
        updatePlayButton();
        console.log('Audio loaded');
    });
}

function togglePlay() {
    if (!song) return;
    
    if (isPlaying) {
        song.pause();
    } else {
        song.play();
    }
    isPlaying = !isPlaying;
    updatePlayButton();
}

function toggleMic() {
    if (useMic) {
        mic.stop();
        useMic = false;
        if (song) fft.setInput(song);
    } else {
        if (song && isPlaying) {
            song.stop();
            isPlaying = false;
            updatePlayButton();
        }
        mic.start();
        fft.setInput(mic);
        useMic = true;
    }
    updateMicButton();
}

function updatePlayButton() {
    const btn = document.getElementById('playBtn');
    btn.textContent = isPlaying ? 'Pause' : 'Play';
}

function updateMicButton() {
    const btn = document.getElementById('micBtn');
    btn.textContent = useMic ? 'Stop Mic' : 'Mic';
    btn.style.borderColor = useMic ? '#fff' : '#333';
}

function mousePressed() {
    // Enable audio context
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
    
    // Check if clicking on volume knob
    let centerX = width / 2;
    let centerY = height / 2;
    let distance = dist(mouseX, mouseY, centerX, centerY);
    
    if (distance <= KNOB_RADIUS * 1.5) {
        // Calculate volume based on mouse position relative to center
        let angle = atan2(mouseY - centerY, mouseX - centerX);
        // Map angle to volume (0 to 1)
        targetVolume = map((angle + PI) % TWO_PI, 0, TWO_PI, 0, 1);
        targetVolume = constrain(targetVolume, 0, 1);
        
        if (song) song.setVolume(targetVolume);
    }
}

function mouseDragged() {
    // Allow dragging to control volume
    let centerX = width / 2;
    let centerY = height / 2;
    let distance = dist(mouseX, mouseY, centerX, centerY);
    
    if (distance <= KNOB_RADIUS * 3) {
        let angle = atan2(mouseY - centerY, mouseX - centerX);
        targetVolume = map((angle + PI) % TWO_PI, 0, TWO_PI, 0, 1);
        targetVolume = constrain(targetVolume, 0, 1);
        
        if (song) song.setVolume(targetVolume);
    }
}

function draw() {
    colorShift += 0.5;
    
    // Kick detection
    kickDetected = false;
    if (smoothBass > prevBassLevel * 1.3 && smoothBass > 80) {
        kickDetected = true;
        kickFlash = 255;
    }
    prevBassLevel = smoothBass;
    
    // Decay kick flash
    kickFlash = lerp(kickFlash, 0, 0.15);
    
    // Calculate flash intensity based on overall energy
    overallEnergy = (smoothBass + smoothMid + smoothHigh) / 3;
    flashIntensity = map(overallEnergy, 0, 200, 0, 40) + (kickFlash * 0.3);
    flashIntensity = constrain(flashIntensity, 0, 80);
    
    // Background with flash effect
    background(5 + flashIntensity * 0.5);
    
    // Screen flash on kick
    if (kickDetected) {
        push();
        fill(0, 255, 255, 30); // Cyan flash
        rect(0, 0, width, height);
        pop();
    }
    
    if (!song && !useMic) {
        drawIdleState();
        return;
    }
    
    time += 0.01;
    volume = lerp(volume, targetVolume, 0.1);
    
    // Analyze audio
    let spectrum = fft.analyze();
    analyzeFrequencies(spectrum);
    
    // Update and draw visualization
    updateBars(spectrum);
    drawBars();
    drawVolumeKnob();
    drawFrequencyIndicators();
    updateFrequencyLabels();
}

function drawIdleState() {
    // Minimal idle animation with neon colors
    push();
    translate(width / 2, height / 2);
    
    // Neon cyan glow
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = '#00ffff';
    stroke(0, 255, 255);
    strokeWeight(2);
    noFill();
    
    let radius = 50 + sin(time * 2) * 10;
    ellipse(0, 0, radius * 2);
    
    // Rotating line with glow
    drawingContext.shadowBlur = 15;
    strokeWeight(3);
    rotate(time);
    line(0, -radius, 0, radius);
    
    drawingContext.shadowBlur = 0; // Reset shadow
    pop();
}

function analyzeFrequencies(spectrum) {
    // Divide spectrum into bass, mid, high
    bassLevel = 0;
    midLevel = 0;
    highLevel = 0;
    
    let bassEnd = spectrum.length * 0.1;
    let midEnd = spectrum.length * 0.4;
    
    // Calculate average levels
    for (let i = 0; i < spectrum.length; i++) {
        if (i < bassEnd) {
            bassLevel += spectrum[i];
        } else if (i < midEnd) {
            midLevel += spectrum[i];
        } else {
            highLevel += spectrum[i];
        }
    }
    
    bassLevel /= bassEnd;
    midLevel /= (midEnd - bassEnd);
    highLevel /= (spectrum.length - midEnd);
    
    // Smooth the values
    smoothBass = lerp(smoothBass, bassLevel, SMOOTHING);
    smoothMid = lerp(smoothMid, midLevel, SMOOTHING);
    smoothHigh = lerp(smoothHigh, highLevel, SMOOTHING);
}

function updateBars(spectrum) {
    for (let i = 0; i < bars.length; i++) {
        let bar = bars[i];
        let spectrumIndex = floor(map(i, 0, bars.length, 0, spectrum.length / 2));
        
        // Calculate target length based on frequency data with more variation
        let rawValue = spectrum[spectrumIndex];
        // Add some randomization and neighboring influence for more organic feel
        let neighborInfluence = 0;
        if (i > 0) neighborInfluence += spectrum[floor(map(i-1, 0, bars.length, 0, spectrum.length / 2))] * 0.2;
        if (i < bars.length - 1) neighborInfluence += spectrum[floor(map(i+1, 0, bars.length, 0, spectrum.length / 2))] * 0.2;
        
        let finalValue = rawValue + neighborInfluence + random(-5, 5);
        bar.targetLength = map(finalValue, 0, 255, MIN_LENGTH, MAX_LENGTH);
        
        // Faster animation for more dynamic response
        bar.length = lerp(bar.length, bar.targetLength, 0.3);
    }
}

function drawBars() {
    push();
    translate(width / 2, height / 2);
    
    for (let i = 0; i < bars.length; i++) {
        let bar = bars[i];
        let alpha = map(bar.length, MIN_LENGTH, MAX_LENGTH, 0.4, 1.0);
        
        // Neon color based on position and intensity
        let hue = (colorShift + (i * 5)) % 360;
        let saturation = map(bar.length, MIN_LENGTH, MAX_LENGTH, 60, 100);
        let brightness = map(bar.length, MIN_LENGTH, MAX_LENGTH, 40, 90);
        
        // Convert HSB to RGB for glow effect
        colorMode(HSB, 360, 100, 100);
        let barColor = color(hue, saturation, brightness);
        colorMode(RGB, 255);
        
        // Add glow effect
        drawingContext.shadowBlur = map(bar.length, MIN_LENGTH, MAX_LENGTH, 5, 25);
        drawingContext.shadowColor = barColor.toString();
        
        stroke(barColor);
        strokeWeight(4);
        strokeCap(ROUND);
        
        // Calculate positions on circle circumference
        let innerX = cos(bar.angle) * CIRCLE_RADIUS;
        let innerY = sin(bar.angle) * CIRCLE_RADIUS;
        let outerX = cos(bar.angle) * (CIRCLE_RADIUS + bar.length + (kickFlash * 0.1));
        let outerY = sin(bar.angle) * (CIRCLE_RADIUS + bar.length + (kickFlash * 0.1));
        
        line(innerX, innerY, outerX, outerY);
        
        // Inner reflection with different color
        let reflectionHue = (hue + 180) % 360;
        colorMode(HSB, 360, 100, 100);
        let reflectionColor = color(reflectionHue, saturation * 0.7, brightness * 0.6);
        colorMode(RGB, 255);
        
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = reflectionColor.toString();
        stroke(reflectionColor);
        strokeWeight(2);
        
        let reflectionLength = bar.length * 0.4;
        let reflectionX = cos(bar.angle) * (CIRCLE_RADIUS - reflectionLength);
        let reflectionY = sin(bar.angle) * (CIRCLE_RADIUS - reflectionLength);
        line(innerX, innerY, reflectionX, reflectionY);
    }
    
    drawingContext.shadowBlur = 0; // Reset shadow
    pop();
}

function drawVolumeKnob() {
    push();
    translate(width / 2, height / 2);
    
    // Main knob colors
    let knobHue = (colorShift * 2) % 360;
    colorMode(HSB, 360, 100, 100);
    let knobColor = color(knobHue, 80, 90);
    let arcColor = color(knobHue, 100, 80);
    colorMode(RGB, 255);
    
    // Outer knob circle with glow
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = knobColor.toString();
    stroke(knobColor);
    strokeWeight(3);
    noFill();
    ellipse(0, 0, KNOB_RADIUS * 2);
    
    // Volume indicator with intense glow
    let volumeAngle = map(volume, 0, 1, -PI, PI);
    drawingContext.shadowBlur = 20;
    stroke(255, 100, 255); // Bright magenta
    drawingContext.shadowColor = '#ff64ff';
    strokeWeight(4);
    let indicatorX = cos(volumeAngle) * (KNOB_RADIUS * 0.7);
    let indicatorY = sin(volumeAngle) * (KNOB_RADIUS * 0.7);
    line(0, 0, indicatorX, indicatorY);
    
    // Center dot with glow
    drawingContext.shadowBlur = 10;
    fill(255, 255, 100); // Bright yellow
    drawingContext.shadowColor = '#ffff64';
    noStroke();
    ellipse(0, 0, 8);
    
    // Volume arc - thickness increases with volume
    let arcThickness = map(volume, 0, 1, 2, 12);
    drawingContext.shadowBlur = arcThickness * 2;
    drawingContext.shadowColor = arcColor.toString();
    stroke(arcColor);
    strokeWeight(arcThickness);
    noFill();
    arc(0, 0, KNOB_RADIUS * 2.2, KNOB_RADIUS * 2.2, -PI, volumeAngle);
    
    // Additional volume ring for visual feedback with kick response
    if (volume > 0.1) {
        let outerRingSize = KNOB_RADIUS * 2.8 + (kickFlash * 0.1);
        drawingContext.shadowBlur = 8;
        stroke(arcColor);
        strokeWeight(1);
        ellipse(0, 0, outerRingSize);
    }
    
    // Extra glow ring on kick
    if (kickDetected) {
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = '#00ffff';
        stroke(0, 255, 255, 100);
        strokeWeight(1);
        ellipse(0, 0, KNOB_RADIUS * 3.5);
    }
    
    drawingContext.shadowBlur = 0; // Reset shadow
    pop();
}

function drawFrequencyIndicators() {
    let centerX = width / 2;
    let centerY = height / 2;
    
    // Bass indicator (bottom) with glow
    let bassSize = map(smoothBass, 0, 255, 10, 30) + (kickFlash * 0.1);
    let bassX = centerX;
    let bassY = centerY + CIRCLE_RADIUS + 100;
    
    push();
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = '#ff0080'; // Hot pink
    fill(255, 0, 128, map(smoothBass, 0, 255, 0.4, 0.9) * 255);
    noStroke();
    ellipse(bassX, bassY, bassSize);
    pop();
    
    // Mid indicator (top right) with glow
    let midSize = map(smoothMid, 0, 255, 8, 20);
    let midX = centerX + CIRCLE_RADIUS * 0.7;
    let midY = centerY - CIRCLE_RADIUS * 0.7;
    
    push();
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = '#00ff80'; // Bright green
    fill(0, 255, 128, map(smoothMid, 0, 255, 0.4, 0.9) * 255);
    noStroke();
    ellipse(midX, midY, midSize);
    pop();
    
    // High indicator (top left) with glow
    let highSize = map(smoothHigh, 0, 255, 6, 16);
    let highX = centerX - CIRCLE_RADIUS * 0.7;
    let highY = centerY - CIRCLE_RADIUS * 0.7;
    
    push();
    drawingContext.shadowBlur = 12;
    drawingContext.shadowColor = '#8080ff'; // Light blue
    fill(128, 128, 255, map(smoothHigh, 0, 255, 0.4, 0.9) * 255);
    noStroke();
    ellipse(highX, highY, highSize);
    pop();
}

function updateFrequencyLabels() {
    let centerX = width / 2;
    let centerY = height / 2;
    
    // Update label positions
    let bassLabel = document.getElementById('bassLabel');
    let midLabel = document.getElementById('midLabel');
    let highLabel = document.getElementById('highLabel');
    
    // Bass label (bottom)
    bassLabel.style.left = (centerX - 15) + 'px';
    bassLabel.style.top = (centerY + CIRCLE_RADIUS + 100) + 'px';
    
    // Mid label (top right)
    midLabel.style.left = (centerX + CIRCLE_RADIUS * 0.7 - 10) + 'px';
    midLabel.style.top = (centerY - CIRCLE_RADIUS * 0.7 - 20) + 'px';
    
    // High label (top left)
    highLabel.style.left = (centerX - CIRCLE_RADIUS * 0.7 - 15) + 'px';
    highLabel.style.top = (centerY - CIRCLE_RADIUS * 0.7 - 20) + 'px';
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Labels will auto-update on next frame
}
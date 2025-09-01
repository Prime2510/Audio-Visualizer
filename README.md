# Audio-Visualizer
A minimal yet visually striking music visualizer built with p5.js that transforms audio into a mesmerizing circular spectrum display with neon aesthetics and interactive volume control.

# 🌈 Neon Music Visualizer

A minimal, neon-aesthetic music visualizer built with p5.js that creates stunning circular frequency visualizations with real-time audio analysis and interactive volume control.

![Neon Music Visualizer](https://img.shields.io/badge/Status-Live-brightgreen) ![p5.js](https://img.shields.io/badge/Built%20with-p5.js-ed225d) ![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-blue)

## ✨ Features

### 🎵 Audio Input
- **File Upload**: Support for MP3, WAV, and other audio formats
- **Microphone Input**: Real-time visualization from your microphone
- **Web Audio API**: High-quality audio processing and analysis

### 🎨 Visual Effects
- **Circular Spectrum**: 64 frequency bars arranged in a perfect circle
- **Neon Glow**: Dynamic HSB color cycling with authentic glow effects
- **Kick Detection**: Screen flashes and visual pulses on bass hits
- **Smooth Animations**: Fluid bar movements with neighbor influence

### 🎛️ Interactive Controls
- **Volume Knob**: Large interactive knob (60px radius) with visual feedback
- **Dynamic Arc**: Volume arc thickness increases from 2px to 12px
- **Frequency Indicators**: Color-coded bass (pink), mid (green), high (blue) indicators
- **Responsive UI**: Clean minimal interface that adapts to screen size

## 🚀 Quick Start

### Prerequisites
- Modern web browser with Web Audio API support
- Local web server (for file loading) or live server extension

### Installation
1. Clone or download the project files
2. Ensure all three files are in the same directory:
   ```
   📁 neon-music-visualizer/
   ├── 📄 index.html
   ├── 🎨 style.css
   └── ⚡ script.js
   ```

### Running
1. **Local Server**: Use a local web server or VS Code Live Server extension
2. **Open**: Navigate to `index.html` in your browser
3. **Enable Audio**: Click anywhere to enable Web Audio context
4. **Load Music**: Click "Load Audio" to upload a music file, or "Mic" for microphone input
5. **Enjoy**: Watch your music come to life in neon!

## 🎮 Controls

| Control | Action |
|---------|--------|
| **Load Audio** | Upload audio file (MP3, WAV, etc.) |
| **Play/Pause** | Control audio playback |
| **Mic** | Toggle microphone input |
| **Volume Knob** | Click/drag center knob to adjust volume |

## 🛠️ Technical Details

### Audio Processing
- **FFT Analysis**: 512-point Fast Fourier Transform
- **Frequency Bands**: Bass (0-10%), Mid (10-40%), High (40-100%)
- **Kick Detection**: Algorithm detects bass spikes >30% above previous level
- **Smoothing**: 15% smoothing factor for stable visualizations

### Visual Rendering
- **Color System**: HSB color mode for smooth rainbow transitions
- **Glow Effects**: Canvas shadow blur for authentic neon appearance
- **Performance**: 60 FPS rendering with optimized drawing functions
- **Responsive**: Automatic scaling and repositioning on window resize

### Browser Compatibility
- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 11.1+
- ✅ Edge 79+

## 📁 File Structure

### `index.html`
Clean HTML structure with minimal controls and proper script loading order.

### `style.css`
Minimal styling focused on:
- Monospace typography (Courier New)
- Transparent button styling
- Mobile-responsive design
- Proper z-indexing for overlay elements

### `script.js`
Core visualization engine featuring:
- p5.js setup and draw loop
- Web Audio API integration
- FFT analysis and frequency band separation
- Circular bar rendering with glow effects
- Interactive volume control
- Kick detection algorithm

## 🎨 Customization

### Color Themes
Modify the color generation in `drawBars()` function:
```javascript
// Change the hue offset for different color schemes
let hue = (colorShift + (i * 5)) % 360; // Current rainbow
let hue = 200; // Static blue theme
let hue = (colorShift + (i * 2)) % 180; // Warm colors only
```

### Bar Count
Adjust the number of frequency bars:
```javascript
const BARS_COUNT = 64; // Change to 32, 128, etc.
```

### Sensitivity
Modify kick detection sensitivity:
```javascript
if (smoothBass > prevBassLevel * 1.3 && smoothBass > 80) {
    // Change 1.3 to 1.1 (more sensitive) or 1.5 (less sensitive)
    // Change 80 to lower/higher threshold
}
```

🐛 Troubleshooting

Audio Not Playing
- Ensure you click somewhere on the page first (browser audio policy)
- Check browser console for audio loading errors
- Verify audio file format is supported

No Microphone Input
- Grant microphone permissions when prompted
- Check browser privacy settings
- Ensure microphone is not used by other applications

Performance Issues
- Close other browser tabs using audio
- Disable browser extensions that might interfere


📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests
- Share your customizations

🙏 Acknowledgments

- **p5.js Community** - For the amazing creative coding framework
- **Web Audio API** - For making real-time audio processing possible in browsers
- **Inspiration** - Electronic music visualizers and codedex challanges



Made with 💜 and p5.js**

*Turn up the volume and watch your music dance in neon!*
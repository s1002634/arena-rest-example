import React from 'react';
import ReactDOM from 'react-dom';
import Composition from './composition.js'
import ResolumeProvider from './resolume_provider'
import './index.css';

// ========================================

function get_option(production, development, fallback) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
        return production;
    } else if (development) {
        return development;
    } else {
        return fallback;
    }
}

const host = get_option(window.location.hostname, process.env.REACT_APP_HOST, '192.168.1.86');
const port = parseInt(get_option(window.location.port, process.env.REACT_APP_PORT, 8081), 10);

ReactDOM.render(
    <ResolumeProvider host={host} port={port}>
        <Composition host={host} port={port} />
    </ResolumeProvider>,
    document.getElementById('grid')
);

// Detect if running in standalone/PWA mode and request fullscreen
const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone ||
                     document.referrer.includes('android-app://');

if (isStandalone) {
    // Running as installed PWA
    document.addEventListener('click', function requestFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
        // Only try once
        document.removeEventListener('click', requestFullscreen);
    }, { once: true });
}

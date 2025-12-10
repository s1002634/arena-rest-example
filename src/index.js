import React from 'react';
import ReactDOM from 'react-dom';
import Composition from './composition.js'
import ResolumeProvider from './resolume_provider'
import './index.css';
import { initToastContainer } from './toast';

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

// In Capacitor (mobile app), use the fallback IP directly
const isCapacitor = window.location.protocol === 'capacitor:' || (window.location.protocol === 'http:' && window.location.hostname === 'localhost');
const host = isCapacitor ? '192.168.1.86' : get_option(window.location.hostname, process.env.REACT_APP_HOST, '192.168.1.86');
const port = parseInt(isCapacitor ? '8081' : get_option(window.location.port, process.env.REACT_APP_PORT, 8080), 10);

ReactDOM.render(
    <ResolumeProvider host={host} port={port}>
        <Composition host={host} port={port} />
    </ResolumeProvider>,
    document.getElementById('grid')
);

// Initialize toast container for notifications
initToastContainer();

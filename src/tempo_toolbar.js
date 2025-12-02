import React from 'react';
import Parameter from './parameter.js';
import "./tempo_toolbar.css"

function TempoToolbar({ tempocontroller }) {
    return (
        <div className="tempo_toolbar">
            <span>
                <Parameter
                    name="RESYNC"
                    parameter={tempocontroller.resync}
                />
            </span>
        </div>
    );
}

export default TempoToolbar;

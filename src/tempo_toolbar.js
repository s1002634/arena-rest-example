import React from 'react';
import Parameter from './parameter.js';
import "./tempo_toolbar.css"

function TempoToolbar({ tempocontroller, audio }) {
    return (
        <div className="tempo_toolbar">
            <div className="resync-section">
                <Parameter
                    name="RESYNC"
                    parameter={tempocontroller.resync}
                />
            </div>
            {audio && audio.volume && (
                <div className="master-volume">
                    <span className="volume-label">音量</span>

                    <Parameter
                        name="Master Volume"
                        parameter={audio.volume}
                        hidelabel="yes"
                        key={audio.volume.id}
                        id={audio.volume.id}
                    />
                </div>
            )}
        </div>
    );
}

export default TempoToolbar;

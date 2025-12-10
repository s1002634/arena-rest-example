import { ResolumeContext } from './resolume_provider'
import React, { useContext, memo } from 'react'
import ParameterMonitor from './parameter_monitor.js'
import Properties from './properties.js';
import PropTypes from 'prop-types';
import './layer.css';

// we need to draw outside of our container, but instead
// draw elsewhere in the html hierarchy
const layer_root = document.getElementById('layer_properties');

/**
 * Memoized clip thumbnail component to prevent unnecessary re-renders
 */
const ClipThumbnail = memo(function ClipThumbnail({ clip }) {
    const context = useContext(ResolumeContext);

    // connected.index >= 3 表示正在播放
    const isConnected = clip.connected?.index >= 3;
    const isSelected = clip.selected?.value;

    const handleConnect = () => {
        context.action('trigger', `/composition/clips/by-id/${clip.id}/connect`);
    };

    return (
        <div
            key={clip.id}
            className={`clip-thumbnail ${isConnected ? 'connected' : ''} ${isSelected ? 'selected' : ''}`}
            onMouseDown={handleConnect}
            onTouchStart={(e) => { e.preventDefault(); handleConnect(); }}
        >
            <div className="clip-preview">
                {clip.thumbnail ? (
                    <img src={context.clip_url(clip.id, clip.thumbnail.last_update)} alt={clip.name?.value || ''} className="thumbnail" />
                ) : (
                    <span className="clip-id">{clip.name?.value || `Clip ${clip.id}`}</span>
                )}
            </div>
            <div className={`clip-label ${isSelected ? 'selected' : ''}`}>
                <span className="clip-name">{clip.name?.value || `Clip ${clip.id}`}</span>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function - only re-render if these specific properties change
    const prevClip = prevProps.clip;
    const nextClip = nextProps.clip;

    return (
        prevClip.id === nextClip.id &&
        prevClip.connected?.index === nextClip.connected?.index &&
        prevClip.selected?.value === nextClip.selected?.value &&
        prevClip.thumbnail?.last_update === nextClip.thumbnail?.last_update &&
        prevClip.name?.value === nextClip.name?.value
    );
});

/**
  * Render a layer
  */
function Layer(props) {
    const context = useContext(ResolumeContext);

    const select    = () => context.action('trigger', `/composition/layers/by-id/${props.id}/select`);
    const stop      = () => context.action('trigger', `/composition/layers/by-id/${props.id}/clear`);

    // 找到當前 Layer 中正在播放的 Clip（connected）或第一個有 transport 的 Clip
    const getTargetClip = () => {
        // 優先找當前 layer 中正在連接/播放的 clip (connected)
        const connectedClip = props.clips?.find(clip =>
            clip.connected?.index >= 3 && clip.transport?.controls?.playdirection?.id
        );

        // 如果沒有正在播放的，找這個 layer 中被選中的 clip
        const selectedClip = props.clips?.find(clip =>
            clip.selected?.value === true && clip.transport?.controls?.playdirection?.id
        );

        // 如果都沒有，找第一個有 transport 的 clip
        const firstClip = props.clips?.find(clip =>
            clip.transport?.controls?.playdirection?.id
        );

        return connectedClip || selectedClip || firstClip;
    };

    // 播放功能
    const play = () => {
        const targetClip = getTargetClip();

        if (targetClip && targetClip.transport?.controls?.playdirection) {
            const playdirection = targetClip.transport.controls.playdirection;

            if (playdirection.id && typeof playdirection.id === 'number') {
                console.log('Playing clip direction:', playdirection.id, playdirection);
                // 根據 options 判斷正確的播放索引: '>' = Forward
                const forwardIndex = playdirection.options?.indexOf('>') ?? 2;
                context.parameters.update_parameter(playdirection.id, forwardIndex);
            } else {
                console.warn('Invalid playdirection parameter:', playdirection);
            }
        } else {
            console.warn('No clip with transport found in layer');
        }
    };

    // 暫停功能
    const pause = () => {
        const targetClip = getTargetClip();

        if (targetClip && targetClip.transport?.controls?.playdirection) {
            const playdirection = targetClip.transport.controls.playdirection;

            if (playdirection.id && typeof playdirection.id === 'number') {
                console.log('Pausing clip direction:', playdirection.id, playdirection);
                // 根據 options 判斷正確的暫停索引: '||' = Pause
                const pauseIndex = playdirection.options?.indexOf('||') ?? 1;
                context.parameters.update_parameter(playdirection.id, pauseIndex);
            } else {
                console.warn('Invalid playdirection parameter:', playdirection);
            }
        } else {
            console.warn('No clip with transport found in layer');
        }
    };

    return (
        <ParameterMonitor.Single parameter={props.name} render={name => (
            <div>
                {/* Layer Row: 水平排列，左側控制 + 右側 clips */}
                <ParameterMonitor.Single parameter={props.selected} render={selected => (
                    <div className={`layer-row ${selected.value ? 'active' : ''}`}>
                        {/* Left Control Area */}
                        <div className="layer-control" onMouseDown={select} onTouchStart={(e) => { e.preventDefault(); select(); }}>
                            <div className="layer-name">L{props.index + 1}</div>
                            <div className="layer-buttons">
                                <div className="layer-btn"
                                     onMouseDown={(e) => { e.stopPropagation(); play(); }}
                                     onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); play(); }}
                                     title="Play">
                                    <div className="icon-play"></div>
                                </div>
                                <div className="layer-btn"
                                     onMouseDown={(e) => { e.stopPropagation(); pause(); }}
                                     onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); pause(); }}
                                     title="Pause">
                                    <div className="icon-pause"></div>
                                </div>
                                <div className="layer-btn"
                                     onMouseDown={(e) => { e.stopPropagation(); stop(); }}
                                     onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); stop(); }}
                                     title="Stop">
                                    <div className="icon-stop"></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Clips Grid */}
                        <div className="clips-grid">
                            {props.clips && props.clips.map(clip => (
                                <ClipThumbnail key={clip.id} clip={clip} />
                            ))}
                        </div>
                    </div>
                )} />

                <ParameterMonitor.Single parameter={props.selected} render={selected => (
                    <React.Fragment>
                        {selected.value &&
                            <Properties
                                name={name.value.replace(/#/g, props.index+1)}
                                dashboard={props.dashboard}
                                autopilot={props.autopilot}
                                transition={props.transition}
                                audio={props.audio}
                                video={props.video}
                                title="Layer"
                                root={layer_root}
                            />
                        }
                    </React.Fragment>
                )} />
            </div>
        )} />
    );
}

/**
  * Property declaration for Layer component
  */
Layer.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.object.isRequired,
    selected: PropTypes.object.isRequired,
    faderstart: PropTypes.object.isRequired,
    ignorecolumntrigger: PropTypes.object.isRequired,
    dashboard: PropTypes.object.isRequired,
    audio: PropTypes.object,
    video: PropTypes.object,
    clips: PropTypes.array
}

export default Layer;

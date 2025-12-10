import { ResolumeContext } from './resolume_provider'
import CrossFader from './crossfader.js'
import Column from './column.js'
import Deck from './deck.js'
import Layer from './layer.js'
import Clip from './clip.js'
import Browser from './browser'
import LayerGroup from './layer_group.js'
import Properties from './properties.js'
import Parameter from './parameter.js'
import VolumeSlider from './volume_slider.js'
import ParameterMonitor from './parameter_monitor.js'
import React, { useContext, useState, useEffect, useCallback } from 'react'
import { showToast } from './toast'

// composition effect controls and browser are rendered elseewhere
const composition_root = document.getElementById('composition_properties');
const browser_root = document.getElementById('browser');

/**
  * Component rendering the entire composition
  */
function Composition() {
    const context = useContext(ResolumeContext);
    const [textBlockContent, setTextBlockContent] = useState('');
    const [hasSourceParams, setHasSourceParams] = useState(false);
    const [activeColumnIndex, setActiveColumnIndex] = useState(null);
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
        navBarHeight: window.innerHeight - window.visualViewport?.height || 0
    });

    // 監聽螢幕尺寸變化
    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
                navBarHeight: window.innerHeight - (window.visualViewport?.height || window.innerHeight)
            });
        };

        window.addEventListener('resize', handleResize);
        window.visualViewport?.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.visualViewport?.removeEventListener('resize', handleResize);
        };
    }, []);

    // 找到選中的 clip 和它的 text 參數（用於更新 UI）
    const getSelectedClipTextParam = (updateState = true) => {
        for (const layer of context.composition.layers) {
            for (const clip of layer.clips) {
                if (clip.selected?.value === true) {
                    console.log('Selected clip found:', clip.id);

                    // 檢查 video.sourceparams 中是否有 text 參數
                    // sourceparams 是一個物件，key 是參數名稱
                    if (clip.video?.sourceparams) {
                        if (updateState) setHasSourceParams(true);
                        for (const key in clip.video.sourceparams) {
                            const param = clip.video.sourceparams[key];

                            // 檢查是否為 ParamText 類型
                            if (param.valuetype === 'ParamText') {
                                console.log('sourceparams', key, 'id', param.id);
                                console.log('sourceparams', key, 'valuetype', param.valuetype);
                                console.log('sourceparams', key, 'value', param.value);

                                // 自動填入 textarea（僅在 updateState 為 true 時）
                                if (updateState) {
                                    setTextBlockContent(param.value || '');
                                }

                                return { clipId: clip.id, textParam: param, paramName: key };
                            }
                        }
                    } else {
                        if (updateState) setHasSourceParams(false);
                    }

                    // 如果沒有 text 參數，清空 textarea
                    console.warn('No text parameter found in selected clip video.sourceparams');
                    if (updateState) {
                        setTextBlockContent('');
                    }
                }
            }
        }
        if (updateState) setHasSourceParams(false);
        return null;
    };

    // 當 clip 選中狀態改變時，自動更新 textarea
    useEffect(() => {
        getSelectedClipTextParam();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context.composition.layers]);

    const columns = context.composition.columns.map((column, index) =>
        <Column
            id={column.id}
            key={column.id}
            index={index}
            name={column.name}
            connected={column.connected}
        />
    );

    // Memoize the onActivate callback to prevent re-renders
    const handleColumnActivate = useCallback((index) => {
        // Defer state update to not block UI
        requestAnimationFrame(() => {
            setActiveColumnIndex(index);
        });
    }, []);

    // 限制前三個 layer 的 columns (用於控制區)
    const columnsLimitedToThreeLayers = context.composition.columns.map((column, index) =>
        <Column
            id={column.id}
            key={column.id}
            index={index}
            name={column.name}
            connected={column.connected}
            limitToFirstThreeLayers={true}
            isActive={activeColumnIndex === index}
            onActivate={handleColumnActivate}
        />
    );

    const { clips, layers_and_groups } = (() => {
        // first get an iterator on both the layers and groups
        const layer_iter = context.composition.layers[Symbol.iterator]();
        const group_iter = context.composition.layergroups[Symbol.iterator]();

        // load the first value from both
        let layer = layer_iter.next().value;
        let group = group_iter.next().value;

        // this will hold all the resulting clips layers
        const clip_rows = [];
        const layers_and_groups = [];

        // we need to keep track of layer and group indices (necessary
        // so we can translate layer names if they are set to default)
        let layer_index = 0;
        let group_index = 0;

        // as long as there are both layers and groups left
        // we are going to have to figure out who comes first
        while (layer || group) {
            // we compare the first layer in the group with the current layer
            // if that's a match, we'll add the group at this spot and then
            // skip all the layers (since they are already in the group)
            if (!layer || (layer && group && layer.id === group.layers[0].id)) {
                // add layer group to result
                layers_and_groups.push(
                    <LayerGroup
                        id={group.id}
                        key={group.id}
                        index={group_index}
                        name={group.name}
                        bypassed={group.bypassed}
                        ignorecolumntrigger={group.ignorecolumntrigger}
                        solo={group.solo}
                        selected={group.selected}
                        layers={group.layers}
                    />
                );

                // skip layers already in group
                for (let i = 0; i < group.layers.length; i++) {
                    // add all the clips
                    clip_rows.push(layer.clips.map(clip =>
                        <Clip
                            id={clip.id}
                            key={clip.id}
                            thumbnail={clip.thumbnail}
                            name={clip.name}
                            selected={clip.selected}
                            connected={clip.connected}
                            dashboard={clip.dashboard}
                            audio={clip.audio}
                            video={clip.video}
                            beatsnap={clip.beatsnap}
                            transporttype={clip.transporttype}
                            target={clip.target}
                            triggerstyle={clip.triggerstyle}
                            faderstart={clip.faderstart}
                            ignorecolumntrigger={clip.ignorecolumntrigger}
                            transport={clip.transport}
                        />
                    ));

                    layer = layer_iter.next().value;
                }

                // add layer group columns
                clip_rows.push(group.columns.map((column, index) =>
                    <Column
                        id={column.id}
                        key={column.id}
                        index={index}
                        name={column.name}
                        connected={column.connected}
                    />
                ));

                // move to next group
                group_index++;
                group = group_iter.next().value;
            } else {
                layers_and_groups.push(
                    <Layer
                        id={layer.id}
                        key={layer.id}
                        index={layer_index}
                        name={layer.name}
                        bypassed={layer.bypassed}
                        solo={layer.solo}
                        crossfadergroup={layer.crossfadergroup}
                        master={layer.master}
                        maskmode={layer.maskmode}
                        faderstart={layer.faderstart}
                        ignorecolumntrigger={layer.ignorecolumntrigger}
                        dashboard={layer.dashboard}
                        autopilot={layer.autopilot}
                        transition={layer.transition}
                        audio={layer.audio}
                        video={layer.video}
                        selected={layer.selected}
                        clips={layer.clips}
                    />
                )

                // add all the clips
                clip_rows.push(layer.clips.map(clip =>
                    <Clip
                        id={clip.id}
                        key={clip.id}
                        thumbnail={clip.thumbnail}
                        name={clip.name}
                        selected={clip.selected}
                        connected={clip.connected}
                        dashboard={clip.dashboard}
                        audio={clip.audio}
                        video={clip.video}
                        beatsnap={clip.beatsnap}
                        transporttype={clip.transporttype}
                        target={clip.target}
                        triggerstyle={clip.triggerstyle}
                        faderstart={clip.faderstart}
                        ignorecolumntrigger={clip.ignorecolumntrigger}
                        transport={clip.transport}
                    />
                ))

                // move to next layer
                layer_index++;
                layer = layer_iter.next().value;
            }
        }

        // reverse and flatten clips
        clip_rows.reverse();
        const clips = Array.prototype.concat.apply([], clip_rows);

        // reverse layers
        layers_and_groups.reverse();

        return { clips, layers_and_groups };
    })();

    const decks = context.composition.decks.map((deck) =>
        <Deck
            id={deck.id}
            key={deck.id}
            name={deck.name}
            selected={deck.selected.value}
        />
    );

    //min is 100 + 5 margin
    const s = {
        gridTemplateColumns: `repeat( ${columns.length}, minmax(105px, 1fr)`
    }

    let crossfader = null;
    if (context.composition.crossfader.id) {
        crossfader = (
            <CrossFader
                key={context.composition.crossfader.id}
                phase={context.composition.crossfader.phase}
                behaviour={context.composition.crossfader.behaviour}
                curve={context.composition.crossfader.curve}
                mixer={context.composition.crossfader.mixer}
            />
        );
    };


    // 整體控制所有 layers 的 play/pause/stop
    const playAll = () => {
        context.composition.layers.forEach(layer => {
            const targetClip = layer.clips?.find(clip =>
                (clip.connected?.index >= 3 || clip.selected?.value === true) && clip.transport?.controls?.playdirection?.id
            ) || layer.clips?.find(clip => clip.transport?.controls?.playdirection?.id);

            if (targetClip && targetClip.transport?.controls?.playdirection) {
                const playdirection = targetClip.transport.controls.playdirection;
                if (playdirection.id && typeof playdirection.id === 'number') {
                    const forwardIndex = playdirection.options?.indexOf('>') ?? 2;
                    context.parameters.update_parameter(playdirection.id, forwardIndex);
                }
            }
        });
        showToast('全域播放', '所有圖層已開始播放');
    };

    const pauseAll = () => {
        context.composition.layers.forEach(layer => {
            const targetClip = layer.clips?.find(clip =>
                (clip.connected?.index >= 3 || clip.selected?.value === true) && clip.transport?.controls?.playdirection?.id
            ) || layer.clips?.find(clip => clip.transport?.controls?.playdirection?.id);

            if (targetClip && targetClip.transport?.controls?.playdirection) {
                const playdirection = targetClip.transport.controls.playdirection;
                if (playdirection.id && typeof playdirection.id === 'number') {
                    const pauseIndex = playdirection.options?.indexOf('||') ?? 1;
                    context.parameters.update_parameter(playdirection.id, pauseIndex);
                }
            }
        });
        showToast('全域暫停', '已暫停');
    };

    const stopAll = () => {
        context.composition.layers.forEach(layer => {
            context.action('trigger', `/composition/layers/by-id/${layer.id}/clear`);
        });
        showToast('全域停止', '所有圖層已停止');
    };

    // 文字區塊處理函數
    const handleTextSubmit = () => {
        // 取得參數 ID，但不更新 state（避免覆蓋使用者編輯的內容）
        const selectedClipData = getSelectedClipTextParam(false);

        if (!selectedClipData) {
            console.warn('No text block clip selected or no text parameter found');
            showToast('錯誤', '請先選擇一個包含 text 參數的 clip');
            return;
        }

        if (textBlockContent.trim()) {
            // 使用參數 ID 直接更新
            console.log('Updating text parameter:', selectedClipData.textParam.id, 'with:', textBlockContent);
            context.parameters.update_parameter(selectedClipData.textParam.id, textBlockContent);
            showToast('已送出文字', textBlockContent);
        }
    };

    const handleTextClear = () => {
        const selectedClipData = getSelectedClipTextParam();

        setTextBlockContent('');

        if (selectedClipData) {
            console.log('Clearing text parameter:', selectedClipData.textParam.id);
            context.parameters.update_parameter(selectedClipData.textParam.id, '');
        }
        showToast('已清除', '文字輸入已清空');
    };

    return (
        <React.Fragment>
            {/* Screen Size Indicator */}
            <div className="screen-size-indicator">
                <div>{screenSize.width} × {screenSize.height}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                    導覽列: {screenSize.navBarHeight}px
                </div>
            </div>

            <div className="composition">
                {/* Layers Container - 垂直堆疊的 layers */}
                <div className="layers-container">
                    {layers_and_groups}
                </div>

                {/* Bottom Control Bar */}
                <div className="control-bar">
                    <div className="control-bar-inner">
                        {/* Global Controls */}
                        <div className="control-section">
                            <span className="global-label">Global</span>
                            <div className="control-btn"
                                 onMouseDown={playAll}
                                 onTouchStart={(e) => { e.preventDefault(); playAll(); }}
                                 title="Play All">
                                <div className="icon-play"></div>
                            </div>
                            <div className="control-btn"
                                 onMouseDown={pauseAll}
                                 onTouchStart={(e) => { e.preventDefault(); pauseAll(); }}
                                 title="Pause All">
                                <div className="icon-pause"></div>
                            </div>
                            <div className="control-btn"
                                 onMouseDown={stopAll}
                                 onTouchStart={(e) => { e.preventDefault(); stopAll(); }}
                                 title="Stop All">
                                <div className="icon-stop"></div>
                            </div>
                        </div>

                        <div className="divider"></div>

                        {/* Resync Button */}
                        {context.composition.tempocontroller.tempo && (
                            <>
                                <Parameter
                                    name="RESYNC"
                                    parameter={context.composition.tempocontroller.resync}
                                />
                                <div className="divider"></div>
                            </>
                        )}

                        {/* Volume Control */}
                        {context.composition.audio && context.composition.audio.volume && (
                            <>
                                <ParameterMonitor.Single
                                    parameter={context.composition.audio.volume}
                                    render={volumeParam => (
                                        <VolumeSlider
                                            value={volumeParam.value}
                                            min={volumeParam.min}
                                            max={volumeParam.max}
                                            onChange={(value) => context.parameters.update_parameter(volumeParam.id, value)}
                                        />
                                    )}
                                />
                                <div className="divider"></div>
                            </>
                        )}

                        {/* Column Buttons */}
                        <div className="columns-controls">
                            {columnsLimitedToThreeLayers}
                        </div>

                        {/* Text Input */}
                        {hasSourceParams && (
                            <div className="text-input-wrapper">
                                <input
                                    type="text"
                                    className="text-input"
                                    value={textBlockContent}
                                    onChange={(e) => setTextBlockContent(e.target.value)}
                                    placeholder="輸入文字..."
                                />
                                <button className="text-action-btn clear-btn" onClick={handleTextClear} title="清除">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                                <button className="text-action-btn send-btn" onClick={handleTextSubmit} title="送出">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Properties
                name="Composition"
                dashboard={context.composition.dashboard}
                audio={context.composition.audio}
                video={context.composition.video}
                title="Composition"
                root={composition_root}
            />
            <Browser
                root={browser_root}
            />
        </React.Fragment>
    );
}

export default Composition;

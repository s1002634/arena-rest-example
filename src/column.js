import { ResolumeContext } from './resolume_provider'
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import ParameterMonitor from './parameter_monitor.js'
import ContextMenu from './context_menu.js';

/**
  * Component rendering a column within the composition
  */
function Column({ id, index, name, connected, limitToFirstThreeLayers, isActive, onActivate }) {
    const context = useContext(ResolumeContext);

    // 自訂連接功能：只觸發前三個 layer 的 clips
    const connectLimitedLayers = (down) => {
        if (down && onActivate) {
            onActivate(index); // 點擊時設置為 active
        }
        // 只觸發前三個 layer
        const layers = context.composition.layers.slice(0, 3);
        layers.forEach((layer) => {
            const clip = layer.clips[index];
            if (clip && clip.id) {
                context.action('trigger', `/composition/clips/by-id/${clip.id}/connect`, down);
            }
        });
    };

    // 預設的連接功能：觸發所有 layer
    const connect = down => {
        if (down && onActivate) {
            onActivate(index); // 點擊時設置為 active
        }
        context.action('trigger', `/composition/columns/by-id/${id}/connect`, down);
    };

    // 根據 prop 決定使用哪個函數
    const handleConnect = limitToFirstThreeLayers ? connectLimitedLayers : connect;

    const menu_options = {
        'Add':                      { action: () => context.post('/composition/columns/add')            },
        'Remove':                   { action: () => context.remove(`/composition/columns/by-id/${id}`)  },
    };

    return (
        <ParameterMonitor.Single parameter={connected} render={connected => (
            <ParameterMonitor.Single parameter={name} render={name => (
                <ContextMenu
                    name={name.value.replace(/#/g, index+1)}
                    options={menu_options}
                >
                    <button
                        className={`column-btn ${isActive ? 'active' : ''}`}
                        onMouseDown={() => handleConnect(true)}
                        onMouseUp={() => handleConnect(false)}
                        onTouchStart={(e) => { e.preventDefault(); handleConnect(true); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleConnect(false); }}
                    >
                        {name.value.replace(/#/g, index+1)}
                    </button>
                </ContextMenu>
            )} />
        )} />
    );
}

/**
  * Property declaration for Column component
  */
Column.propTypes = {
    id: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    name: PropTypes.object.isRequired,
    connected: PropTypes.object.isRequired,
    limitToFirstThreeLayers: PropTypes.bool,
    isActive: PropTypes.bool,
    onActivate: PropTypes.func,
}

export default Column;

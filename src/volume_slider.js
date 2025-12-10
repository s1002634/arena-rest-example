import React, { useState, useRef } from 'react';
import './volume_slider.css';

function VolumeSlider({ value, min, max, onChange }) {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef(null);

    // 計算填充百分比
    const percent = ((value - min) / (max - min)) * 100;

    // 處理滑鼠/觸控開始
    const handleStart = (e) => {
        e.preventDefault();
        setIsDragging(true);
        updateValue(e);

        // 添加全局事件監聽
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleEnd);
    };

    // 處理移動
    const handleMove = (e) => {
        if (!isDragging && e.type !== 'mousemove') return;
        updateValue(e);
    };

    // 處理結束
    const handleEnd = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
    };

    // 更新數值
    const updateValue = (e) => {
        if (!sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newValue = min + percentage * (max - min);

        if (onChange) {
            onChange(newValue);
        }
    };

    // 點擊滑桿直接跳轉
    const handleClick = (e) => {
        if (e.target === sliderRef.current || e.target.classList.contains('volume-fill')) {
            updateValue(e);
        }
    };

    return (
        <div className="volume-control">
            <svg className="volume-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
            <div
                ref={sliderRef}
                className="volume-slider"
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                onClick={handleClick}
            >
                <div className="volume-fill" style={{ width: `${percent}%` }}>
                    <div className="volume-thumb"></div>
                </div>
            </div>
            <span className="volume-text">{Math.round(percent)}%</span>
        </div>
    );
}

VolumeSlider.defaultProps = {
    min: 0,
    max: 1,
    value: 0.7
};

export default VolumeSlider;

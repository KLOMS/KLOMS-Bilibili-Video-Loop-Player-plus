// ==UserScript==
// @name         Bilibili Video Loop Player plus
// @version      1.04
// @description  实现Bilibili视频片段的循环播放，时间单位为分钟，支持每30秒倒退0.2秒，播放三次后停止循环。带有可拖动的悬浮窗和智能调时功能。
// @author       Kloms
// @match        *://*.bilibili.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建悬浮按钮
    const createFloatButton = () => {
        const button = document.createElement('button');
        button.innerText = '🎬';
        button.style.position = 'fixed';
        button.style.bottom = '10px';
        button.style.left = '10px'; // 移动到左下角
        button.style.zIndex = '1001';
        button.style.backgroundColor = '#ff6347';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.width = '40px';
        button.style.height = '40px';
        button.style.fontSize = '20px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';

        document.body.appendChild(button);

        return button;
    };

    // 创建UI元素
    const createUI = () => {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '10px'; // 调整初始位置
        container.style.left = '60px'; // 放置在悬浮窗右侧
        container.style.zIndex = '1000';
        container.style.backgroundColor = '#fff';
        container.style.padding = '10px';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '5px';
        container.style.display = 'block'; // 默认显示
        container.style.flexDirection = 'column';
        container.style.width = '250px'; // 设置固定宽度

        // 拖动功能
        let isDragging = false;
        let offsetX, offsetY;

        container.onmousedown = (e) => {
            isDragging = true;
            offsetX = e.clientX - container.offsetLeft;
            offsetY = e.clientY - container.offsetTop;
        };

        document.onmousemove = (event) => {
            if (isDragging) {
                container.style.left = event.clientX - offsetX + 'px';
                container.style.top = event.clientY - offsetY + 'px';
                container.style.bottom = 'auto'; // 确保底部位置不被影响
            }
        };

        document.onmouseup = () => {
            isDragging = false;
        };

        const inputStartContainer = document.createElement('div');
        inputStartContainer.style.display = 'flex';
        inputStartContainer.style.alignItems = 'center';

        const inputStart = document.createElement('input');
        inputStart.type = 'text';
        inputStart.placeholder = '开始时间 (分钟)';
        inputStart.style.marginRight = '5px';

        const increaseButton = document.createElement('button');
        increaseButton.innerText = '+';
        increaseButton.style.cursor = 'pointer';
        increaseButton.style.marginRight = '10px';
        increaseButton.style.width = '50px';
        increaseButton.style.height = '30px';

        inputStartContainer.appendChild(inputStart);
        inputStartContainer.appendChild(increaseButton);

        const inputEndContainer = document.createElement('div');
        inputEndContainer.style.display = 'flex';
        inputEndContainer.style.alignItems = 'center';

        const inputEnd = document.createElement('input');
        inputEnd.type = 'text';
        inputEnd.placeholder = '结束时间 (分钟)';
        inputEnd.style.marginRight = '5px';

        const decreaseButton = document.createElement('button');
        decreaseButton.innerText = '-';
        decreaseButton.style.cursor = 'pointer';
        decreaseButton.style.marginRight = '10px';
        decreaseButton.style.width = '50px';
        decreaseButton.style.height = '30px';

        inputEndContainer.appendChild(inputEnd);
        inputEndContainer.appendChild(decreaseButton);

        const timeAdjustInput = document.createElement('input');
        timeAdjustInput.type = 'number';
        timeAdjustInput.value = 5; // 默认五分钟
        timeAdjustInput.min = 0;
        timeAdjustInput.step = 1;
        timeAdjustInput.style.marginBottom = '10px';
        timeAdjustInput.style.width = '100px';

        const checkboxContainer = document.createElement('div');
        checkboxContainer.style.display = 'flex';
        checkboxContainer.style.alignItems = 'center';

        const checkboxRewind = document.createElement('input');
        checkboxRewind.type = 'checkbox';
        checkboxRewind.id = 'rewindCheckbox';
        checkboxRewind.style.marginRight = '5px';

        const checkboxLabelRewind = document.createElement('label');
        checkboxLabelRewind.htmlFor = 'rewindCheckbox';
        checkboxLabelRewind.innerText = '音轨同步';
        checkboxLabelRewind.style.marginRight = '10px';

        const checkboxCloseAfterThree = document.createElement('input');
        checkboxCloseAfterThree.type = 'checkbox';
        checkboxCloseAfterThree.id = 'closeAfterThreeCheckbox';
        checkboxCloseAfterThree.style.marginRight = '5px';

        const checkboxLabelCloseAfterThree = document.createElement('label');
        checkboxLabelCloseAfterThree.htmlFor = 'closeAfterThreeCheckbox';
        checkboxLabelCloseAfterThree.innerText = '三次停止循环';
        checkboxLabelCloseAfterThree.style.marginRight = '10px';

        const checkboxSmartTiming = document.createElement('input');
        checkboxSmartTiming.type = 'checkbox';
        checkboxSmartTiming.id = 'smartTimingCheckbox';
        checkboxSmartTiming.style.marginRight = '5px';

        const checkboxLabelSmartTiming = document.createElement('label');
        checkboxLabelSmartTiming.htmlFor = 'smartTimingCheckbox';
        checkboxLabelSmartTiming.innerText = '智能调时';

        checkboxContainer.appendChild(checkboxRewind);
        checkboxContainer.appendChild(checkboxLabelRewind);
        checkboxContainer.appendChild(checkboxCloseAfterThree);
        checkboxContainer.appendChild(checkboxLabelCloseAfterThree);
        checkboxContainer.appendChild(checkboxSmartTiming);
        checkboxContainer.appendChild(checkboxLabelSmartTiming);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';

        const startButton = document.createElement('button');
        startButton.innerText = '开始循环';
        startButton.style.cursor = 'pointer';

        const refreshButton = document.createElement('button');
        refreshButton.innerText = '刷新页面';
        refreshButton.style.cursor = 'pointer';

        buttonContainer.appendChild(startButton);
        buttonContainer.appendChild(refreshButton);

        const status = document.createElement('span');
        status.innerText = '';
        status.style.color = 'green';

        container.appendChild(inputStartContainer);
        container.appendChild(inputEndContainer);
        container.appendChild(timeAdjustInput);
        container.appendChild(checkboxContainer);
        container.appendChild(buttonContainer);
        container.appendChild(status);

        document.body.appendChild(container);

        // 加载上次保存的时间和设置
        const loadSavedSettings = () => {
            const savedStart = localStorage.getItem('startTime');
            const savedEnd = localStorage.getItem('endTime');
            const savedRewind = localStorage.getItem('rewind');
            const savedCloseAfterThree = localStorage.getItem('closeAfterThree');
            const savedSmartTiming = localStorage.getItem('smartTiming');

            if (savedStart !== null && savedEnd !== null) {
                inputStart.value = savedStart;
                inputEnd.value = savedEnd;
            }

            if (savedRewind !== null) {
                checkboxRewind.checked = savedRewind === 'true';
            }

            if (savedCloseAfterThree !== null) {
                checkboxCloseAfterThree.checked = savedCloseAfterThree === 'true';
            }

            if (savedSmartTiming !== null) {
                checkboxSmartTiming.checked = savedSmartTiming === 'true';
            }
        };

        // 保存当前时间和其他设置
        const saveCurrentTimesAndSettings = () => {
            if (checkboxSmartTiming.checked) {
                localStorage.setItem('startTime', inputStart.value);
                localStorage.setItem('endTime', inputEnd.value);
            } else {
                localStorage.removeItem('startTime');
                localStorage.removeItem('endTime');
            }

            localStorage.setItem('rewind', checkboxRewind.checked);
            localStorage.setItem('closeAfterThree', checkboxCloseAfterThree.checked);
            localStorage.setItem('smartTiming', checkboxSmartTiming.checked);
        };

        // 初始加载保存的时间和设置
        loadSavedSettings();

        increaseButton.addEventListener('click', () => {
            const adjustTime = parseFloat(timeAdjustInput.value);
            if (!isNaN(adjustTime)) {
                const currentStart = parseFloat(inputStart.value) || 0;
                const currentEnd = parseFloat(inputEnd.value) || 0;
                inputStart.value = (currentStart + adjustTime).toFixed(2);
                inputEnd.value = (currentEnd + adjustTime).toFixed(2);
            }
        });

        decreaseButton.addEventListener('click', () => {
            const adjustTime = parseFloat(timeAdjustInput.value);
            if (!isNaN(adjustTime)) {
                const currentStart = parseFloat(inputStart.value) || 0;
                const currentEnd = parseFloat(inputEnd.value) || 0;
                inputStart.value = Math.max(0, (currentStart - adjustTime)).toFixed(2);
                inputEnd.value = Math.max(currentStart, (currentEnd - adjustTime)).toFixed(2); // 结束时间不能小于开始时间
            }
        });

        let loopListener = null;

        startButton.addEventListener('click', () => {
            saveCurrentTimesAndSettings();
            const video = document.querySelector('video');
            if (!video) {
                status.innerText = '未找到视频元素！';
                return;
            }

            // 清除之前的事件监听器
            if (loopListener) {
                video.removeEventListener('timeupdate', loopListener);
            }

            const startTime = parseFloat(inputStart.value) * 60; // 转换为秒
            const endTime = parseFloat(inputEnd.value) * 60; // 转换为秒

            if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) {
                status.innerText = '请输入正确的时间范围！';
                return;
            }

            video.currentTime = startTime;
            video.play();

            let lastRewindTime = 0;
            let playCount = 0;

            loopListener = function() {
                if (video.currentTime >= endTime) {
                    video.currentTime = startTime;
                    playCount++;
                    if (playCount === 3 && checkboxCloseAfterThree.checked) {
                        video.pause();
                        video.removeEventListener('timeupdate', loopListener);
                        status.innerText = '已停止循环';
                        return;
                    }
                }

                if (checkboxRewind.checked && video.currentTime - lastRewindTime >= 30) {
                    lastRewindTime = video.currentTime;
                    video.currentTime -= 0.2;
                }

                status.innerText = '正在循环...';
            };

            video.addEventListener('timeupdate', loopListener);
        });

        refreshButton.addEventListener('click', () => {
            location.reload();
        });

        return container;
    };

    // 初始化UI和浮动按钮
    const floatButton = createFloatButton();
    const uiContainer = createUI();

    // 记录窗口的原始位置
    let originalPosition = { left: uiContainer.style.left, top: uiContainer.style.top };

    floatButton.addEventListener('click', () => {
        if (uiContainer.style.display === 'none') {
            uiContainer.style.display = 'block';
            uiContainer.style.left = originalPosition.left;
            uiContainer.style.top = originalPosition.top;
        } else {
            originalPosition = { left: uiContainer.style.left, top: uiContainer.style.top };
            uiContainer.style.display = 'none';
        }
    });
})();




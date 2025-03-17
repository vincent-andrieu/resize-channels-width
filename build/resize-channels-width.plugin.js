/**
 * @name ResizeChannelsWidth
 * @author gassastsina
 * @description Make the channels list resizable with the mouse
 * @version 1.0.0
 * @authorId 292388871381975040
 * @source https://github.com/vincent-andrieu/resize-channels-width
 * @updateUrl https://raw.githubusercontent.com/vincent-andrieu/resize-channels-width/refs/heads/main/build/resize-channels-width.plugin.js
 */
'use strict';

const NAME = "ResizeChannelsWidth";
const LOG_PREFIX = `[${NAME}]`;
const SIDEBAR_SELECTOR = '[class^="sidebar_"]';
const RESIZER_ID = "sidebar-resizer";
const OVERRIDE_STYLE_ID = "resize-channels-width-styles";
const SETTING_SIDEBAR_WIDTH = "sidebarWidth";
const RESIZER_WIDTH = 7;
const SIDEBAR_MIN_WIDTH = 45;
const SIDEBAR_MAX_WIDTH = 600;
const DEFAULT_SIDEBAR_WIDTH = 240;
class ResizeChannelsWidth {
    initialX = 0;
    initialWidth = 0;
    isResizing = false;
    start() {
        console.warn(LOG_PREFIX, "Started");
        this._injectCustomStyles();
        this._addResizer();
        this._resizerDoubleClick();
    }
    stop() {
        this._removeCustomStyles();
        this._removeResizer();
        console.warn(LOG_PREFIX, "Stopped");
    }
    _getSidebar() {
        const sidebar = document.querySelector(SIDEBAR_SELECTOR);
        if (!sidebar) {
            throw new Error("Could not find sidebar element");
        }
        return sidebar;
    }
    _addResizer() {
        const sidebar = this._getSidebar();
        sidebar.style.setProperty("position", "relative");
        this._setSidebarLastWidth(sidebar);
        const resizer = document.createElement("div");
        resizer.id = RESIZER_ID;
        resizer.style.setProperty("width", `${RESIZER_WIDTH}px`);
        resizer.style.setProperty("height", "100%");
        resizer.style.setProperty("position", "absolute");
        resizer.style.setProperty("right", "0");
        resizer.style.setProperty("top", "0");
        resizer.style.setProperty("cursor", "ew-resize");
        resizer.style.setProperty("z-index", "10");
        sidebar.appendChild(resizer);
        resizer.addEventListener("mousedown", this._onMouseDownSubscription);
        document.addEventListener("mousemove", this._onMouseMoveSubscription);
        document.addEventListener("mouseup", this._onMouseUpSubscription);
    }
    _setSidebarLastWidth(sidebar) {
        let savedWidth = BdApi.Data.load(NAME, SETTING_SIDEBAR_WIDTH);
        if (savedWidth) {
            if (savedWidth < SIDEBAR_MIN_WIDTH || savedWidth > SIDEBAR_MAX_WIDTH) {
                savedWidth = DEFAULT_SIDEBAR_WIDTH;
                BdApi.Data.save(NAME, SETTING_SIDEBAR_WIDTH, savedWidth);
            }
            sidebar.style.setProperty("width", `${savedWidth}px`, "important");
        }
    }
    _onMouseDown = (event) => {
        const sidebar = this._getSidebar();
        this.isResizing = true;
        this.initialX = event.clientX;
        this.initialWidth = sidebar.offsetWidth;
        document.body.style.setProperty("user-select", "none");
        document.body.style.setProperty("cursor", "ew-resize");
    };
    _onMouseMove = (event) => {
        if (!this.isResizing)
            return;
        const width = this.initialWidth + (event.clientX - this.initialX);
        if (width >= SIDEBAR_MIN_WIDTH && width <= SIDEBAR_MAX_WIDTH) {
            const sidebar = this._getSidebar();
            sidebar.style.setProperty("width", `${width}px`, "important");
            document.body.style.setProperty("cursor", "ew-resize");
            BdApi.Data.save(NAME, SETTING_SIDEBAR_WIDTH, width);
        }
        else {
            document.body.style.setProperty("user-select", "none");
            document.body.style.setProperty("cursor", "not-allowed");
        }
    };
    _onMouseUp = () => {
        this.isResizing = false;
        document.body.style.setProperty("user-select", "");
        document.body.style.setProperty("cursor", "");
    };
    _removeResizer() {
        const resizer = document.getElementById(RESIZER_ID);
        resizer?.removeEventListener("mousedown", this._onMouseDownSubscription);
        document.removeEventListener("mousemove", this._onMouseMoveSubscription);
        document.removeEventListener("mouseup", this._onMouseUpSubscription);
        if (resizer?.parentNode) {
            resizer.parentNode.removeChild(resizer);
        }
        const sidebar = document.querySelector(SIDEBAR_SELECTOR);
        sidebar?.style.removeProperty("position");
        sidebar?.style.removeProperty("width");
    }
    _resizerDoubleClick = () => {
        const resizer = document.getElementById(RESIZER_ID);
        resizer?.addEventListener("dblclick", () => {
            const sidebar = this._getSidebar();
            if (sidebar.offsetWidth === DEFAULT_SIDEBAR_WIDTH) {
                sidebar.style.setProperty("width", `${SIDEBAR_MAX_WIDTH}px`, "important");
                BdApi.Data.save(NAME, SETTING_SIDEBAR_WIDTH, SIDEBAR_MAX_WIDTH);
            }
            else {
                sidebar.style.removeProperty("width");
                BdApi.Data.delete(NAME, SETTING_SIDEBAR_WIDTH);
            }
        });
    };
    _injectCustomStyles() {
        const style = document.createElement("style");
        style.id = OVERRIDE_STYLE_ID;
        style.textContent = `
            [class^="channel_"] {
                max-width: none;
            }
        `;
        document.head.appendChild(style);
    }
    _removeCustomStyles() {
        const style = document.getElementById(OVERRIDE_STYLE_ID);
        if (style) {
            style.remove();
        }
    }
    _onMouseDownSubscription = this._onMouseDown.bind(this);
    _onMouseMoveSubscription = this._onMouseMove.bind(this);
    _onMouseUpSubscription = this._onMouseUp.bind(this);
}

module.exports = ResizeChannelsWidth;

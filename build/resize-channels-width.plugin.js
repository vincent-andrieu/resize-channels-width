/**
 * @name ResizeChannelsWidth
 * @author gassastsina
 * @description Resize the sidebar with the mouse or double click on the right border
 * @version 1.0.0
 * @authorId 292388871381975040
 * @source https://github.com/vincent-andrieu/resize-channels-width
 * @updateUrl https://raw.githubusercontent.com/vincent-andrieu/resize-channels-width/refs/heads/main/build/resize-channels-width.plugin.js
 */
'use strict';

const NAME = "ResizeChannelsWidth";
const LOG_PREFIX = `[${NAME}]`;
const DEFAULT_SIDEBAR_WIDTH = 240;
const SIDEBAR_MIN_WIDTH = 45;
const SIDEBAR_MAX_WIDTH = 600;
const DEFAULT_RESIZER_WIDTH = 5;
const RESIZER_MIN_WIDTH = 1;
const RESIZER_MAX_WIDTH = 20;
const SETTING_SIDEBAR_WIDTH = "sidebarWidth";
const SETTING_DEFAULT_SIDEBAR_WIDTH = "defaultSidebarWidth";
const SETTING_RESIZER_WIDTH = "resizerWidth";
function getConfig() {
    return {
        name: NAME,
        settings: [
            {
                type: "number",
                id: SETTING_DEFAULT_SIDEBAR_WIDTH,
                name: "Default sidebar width",
                note: "240px by default",
                value: BdApi.Data.load(NAME, SETTING_DEFAULT_SIDEBAR_WIDTH) || DEFAULT_SIDEBAR_WIDTH,
                defaultValue: DEFAULT_SIDEBAR_WIDTH,
                min: SIDEBAR_MIN_WIDTH,
                max: SIDEBAR_MAX_WIDTH
            },
            {
                type: "number",
                id: SETTING_RESIZER_WIDTH,
                name: "Resizer width",
                note: `Width of the sidebar right border to resize it (${DEFAULT_RESIZER_WIDTH}px by default)`,
                value: BdApi.Data.load(NAME, SETTING_RESIZER_WIDTH) || DEFAULT_RESIZER_WIDTH,
                defaultValue: DEFAULT_RESIZER_WIDTH,
                min: RESIZER_MIN_WIDTH,
                max: RESIZER_MAX_WIDTH
            }
        ]
    };
}
function getSetting(id, settingsList = getConfig().settings) {
    for (const setting of settingsList) {
        if (setting.type === "category") {
            const result = getSetting(id, setting.settings);
            if (result !== undefined) {
                return result;
            }
        }
        else if (setting.id === id) {
            return setting.value;
        }
    }
    return undefined;
}

const SIDEBAR_SELECTOR = '[class^="sidebar_"]';
const RESIZER_ID = "sidebar-resizer";
const OVERRIDE_STYLE_ID = "resize-channels-width-styles";
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
    getSettingsPanel() {
        return BdApi.UI.buildSettingsPanel({
            settings: getConfig().settings,
            onChange: (_category, id, value) => {
                if (id === SETTING_RESIZER_WIDTH) {
                    if (value >= RESIZER_MIN_WIDTH && value <= RESIZER_MAX_WIDTH) {
                        BdApi.Data.save(getConfig().name, id, value);
                        const resizer = document.getElementById(RESIZER_ID);
                        resizer?.style.setProperty("width", `${value}px`);
                    }
                }
                else if (id === SETTING_DEFAULT_SIDEBAR_WIDTH) {
                    if (value >= SIDEBAR_MIN_WIDTH && value <= SIDEBAR_MAX_WIDTH) {
                        BdApi.Data.save(getConfig().name, id, value);
                    }
                }
                else {
                    BdApi.Data.save(getConfig().name, id, value);
                }
            }
        });
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
        const resizerWidth = getSetting(SETTING_RESIZER_WIDTH) || DEFAULT_RESIZER_WIDTH;
        const resizer = document.createElement("div");
        resizer.id = RESIZER_ID;
        resizer.style.setProperty("width", `${resizerWidth}px`);
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
                savedWidth = getSetting(SETTING_DEFAULT_SIDEBAR_WIDTH) || DEFAULT_SIDEBAR_WIDTH;
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
            const defaultSidebarWidth = getSetting(SETTING_DEFAULT_SIDEBAR_WIDTH) || DEFAULT_SIDEBAR_WIDTH;
            if (sidebar.offsetWidth == defaultSidebarWidth) {
                sidebar.style.setProperty("width", `${SIDEBAR_MAX_WIDTH}px`, "important");
                BdApi.Data.save(NAME, SETTING_SIDEBAR_WIDTH, SIDEBAR_MAX_WIDTH);
            }
            else {
                sidebar.style.setProperty("width", `${defaultSidebarWidth}px`, "important");
                BdApi.Data.save(NAME, SETTING_SIDEBAR_WIDTH, defaultSidebarWidth);
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

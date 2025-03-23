import {
    DEFAULT_RESIZER_WIDTH,
    DEFAULT_SIDEBAR_WIDTH,
    getConfig,
    getSetting,
    LOG_PREFIX,
    NAME,
    RESIZER_MAX_WIDTH,
    RESIZER_MIN_WIDTH,
    SETTING_DEFAULT_SIDEBAR_WIDTH,
    SETTING_RESIZER_WIDTH,
    SETTING_SIDEBAR_WIDTH,
    SIDEBAR_MAX_WIDTH,
    SIDEBAR_MIN_WIDTH
} from "./settings";

const SIDEBAR_SELECTOR = '[class^="sidebar_"]';
const RESIZER_ID = "sidebar-resizer";
const OVERRIDE_STYLE_ID = "resize-channels-width-styles";

export default class ResizeChannelsWidth {
    private initialX: number = 0;
    private initialWidth: number = 0;
    private isResizing: boolean = false;

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
                } else if (id === SETTING_DEFAULT_SIDEBAR_WIDTH) {
                    if (value >= SIDEBAR_MIN_WIDTH && value <= SIDEBAR_MAX_WIDTH) {
                        BdApi.Data.save(getConfig().name, id, value);
                    }
                } else {
                    BdApi.Data.save(getConfig().name, id, value);
                }
            }
        });
    }

    private _getSidebar(): HTMLElement {
        const sidebar = document.querySelector(SIDEBAR_SELECTOR);

        if (!sidebar) {
            throw new Error("Could not find sidebar element");
        }
        return sidebar as HTMLElement;
    }

    private _addResizer() {
        const sidebar = this._getSidebar();

        sidebar.style.setProperty("position", "relative");
        this._setSidebarLastWidth(sidebar);

        const resizerWidth = getSetting<number>(SETTING_RESIZER_WIDTH) || DEFAULT_RESIZER_WIDTH;
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

    private _setSidebarLastWidth(sidebar: HTMLElement): void {
        let savedWidth = BdApi.Data.load<number>(NAME, SETTING_SIDEBAR_WIDTH);

        if (savedWidth) {
            if (savedWidth < SIDEBAR_MIN_WIDTH || savedWidth > SIDEBAR_MAX_WIDTH) {
                savedWidth = getSetting<number>(SETTING_DEFAULT_SIDEBAR_WIDTH) || DEFAULT_SIDEBAR_WIDTH;
                BdApi.Data.save(NAME, SETTING_SIDEBAR_WIDTH, savedWidth);
            }

            sidebar.style.setProperty("width", `${savedWidth}px`, "important");
        }
    }

    private _onMouseDown = (event: MouseEvent) => {
        const sidebar = this._getSidebar();
        this.isResizing = true;
        this.initialX = event.clientX;
        this.initialWidth = sidebar.offsetWidth;

        document.body.style.setProperty("user-select", "none");
        document.body.style.setProperty("cursor", "ew-resize");
    };

    private _onMouseMove = (event: MouseEvent) => {
        if (!this.isResizing) return;
        const width = this.initialWidth + (event.clientX - this.initialX);

        if (width >= SIDEBAR_MIN_WIDTH && width <= SIDEBAR_MAX_WIDTH) {
            const sidebar = this._getSidebar();

            sidebar.style.setProperty("width", `${width}px`, "important");
            document.body.style.setProperty("cursor", "ew-resize");
            BdApi.Data.save<number>(NAME, SETTING_SIDEBAR_WIDTH, width);
        } else {
            document.body.style.setProperty("user-select", "none");
            document.body.style.setProperty("cursor", "not-allowed");
        }
    };

    private _onMouseUp = () => {
        this.isResizing = false;
        document.body.style.setProperty("user-select", "");
        document.body.style.setProperty("cursor", "");
    };

    private _removeResizer() {
        const resizer = document.getElementById(RESIZER_ID);
        resizer?.removeEventListener("mousedown", this._onMouseDownSubscription);
        document.removeEventListener("mousemove", this._onMouseMoveSubscription);
        document.removeEventListener("mouseup", this._onMouseUpSubscription);

        if (resizer?.parentNode) {
            resizer.parentNode.removeChild(resizer);
        }

        const sidebar = document.querySelector(SIDEBAR_SELECTOR) as HTMLElement | null;
        sidebar?.style.removeProperty("position");
        sidebar?.style.removeProperty("width");
    }

    private _resizerDoubleClick = () => {
        const resizer = document.getElementById(RESIZER_ID);

        resizer?.addEventListener("dblclick", () => {
            const sidebar = this._getSidebar();
            const defaultSidebarWidth = getSetting<number>(SETTING_DEFAULT_SIDEBAR_WIDTH) || DEFAULT_SIDEBAR_WIDTH;

            if (sidebar.offsetWidth == defaultSidebarWidth) {
                sidebar.style.setProperty("width", `${SIDEBAR_MAX_WIDTH}px`, "important");
                BdApi.Data.save<number>(NAME, SETTING_SIDEBAR_WIDTH, SIDEBAR_MAX_WIDTH);
            } else {
                sidebar.style.setProperty("width", `${defaultSidebarWidth}px`, "important");
                BdApi.Data.save<number>(NAME, SETTING_SIDEBAR_WIDTH, defaultSidebarWidth);
            }
        });
    };

    private _injectCustomStyles() {
        const style = document.createElement("style");

        style.id = OVERRIDE_STYLE_ID;
        style.textContent = `
            [class^="channel_"] {
                max-width: none;
            }

            section[class^="panels_"] > [class^="container_"] {
                justify-content: space-between;
            }
        `;
        document.head.appendChild(style);
    }

    private _removeCustomStyles() {
        const style = document.getElementById(OVERRIDE_STYLE_ID);

        if (style) {
            style.remove();
        }
    }

    private _onMouseDownSubscription: typeof ResizeChannelsWidth.prototype._onMouseDown = this._onMouseDown.bind(this);
    private _onMouseMoveSubscription: typeof ResizeChannelsWidth.prototype._onMouseMove = this._onMouseMove.bind(this);
    private _onMouseUpSubscription: typeof ResizeChannelsWidth.prototype._onMouseUp = this._onMouseUp.bind(this);
}

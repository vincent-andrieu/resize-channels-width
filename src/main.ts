const NAME = "ResizeChannelsWidth";
const LOG_PREFIX = `[${NAME}]`;
const SIDEBAR_SELECTOR = '[class^="sidebar_"]';
const OVERRIDE_STYLE_ID = "resize-channels-width-styles";
const SETTING_SIDEBAR_WIDTH = "sidebarWidth";
const RESIZER_WIDTH = 6;
const SIDEBAR_MIN_WIDTH = 45;
const SIDEBAR_MAX_WIDTH = 600;
const DEFAULT_SIDEBAR_WIDTH = 240;

export default class ResizeChannelsWidth {
    private initialX: number = 0;
    private initialWidth: number = 0;
    private isResizing: boolean = false;

    start() {
        console.warn(LOG_PREFIX, "Started");

        this._injectCustomStyles();
        this._addResizer();
    }

    stop() {
        this._removeCustomStyles();
        this._removeResizer();

        console.warn(LOG_PREFIX, "Stopped");
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

        const resizer = document.createElement("div");
        resizer.id = "sidebar-resizer";
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

    private _setSidebarLastWidth(sidebar: HTMLElement): void {
        let savedWidth = BdApi.Data.load<number>(NAME, SETTING_SIDEBAR_WIDTH);

        if (savedWidth) {
            if (savedWidth < SIDEBAR_MIN_WIDTH || savedWidth > SIDEBAR_MAX_WIDTH) {
                savedWidth = DEFAULT_SIDEBAR_WIDTH;
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
        const resizer = document.getElementById("sidebar-resizer");
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

    private _injectCustomStyles() {
        const style = document.createElement("style");

        style.id = OVERRIDE_STYLE_ID;
        style.textContent = `
            [class^="channel_"] {
                max-width: none;
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

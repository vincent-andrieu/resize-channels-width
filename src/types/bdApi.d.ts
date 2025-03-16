type BdApiInstance = typeof BdApiModule;

declare global {
    const BdApi: BdApiInstance;
}

declare const BdApi: BdApiInstance;

declare module BdApiModule {
    export const React: React;
    export const ReactDOM: any;
    export const Plugins: Plugins;
    export const Components: Components;
    export const Data: Data;
    export const DOM: DOM;
    export const Patcher: Patcher;
    export const UI: UI;
    export const Utils: Utils;
    export const Webpack: Webpack;

    export const alert: (title: string, content: string | HTMLElement | Array<string | HTMLElement>) => void;
}

type PropsWithChildren<P> = HTMLElement | ({ children?: HTMLElement | (HTMLElement | string)[] | string } & P);

type React = {
    useState<T>(initialState: T): [T, (value: T) => void];
    createElement<T extends Components[keyof Components]>(component: T, props?: Parameters<T>[0], ...children: Array<Node | string | Array<Node | string>>): HTMLElement;
    createElement(component: string, props?: any, ...children: Array<Node | string | Array<Node | string>>): HTMLElement;
    createElement<T extends Components[keyof Components]>(component: T | string, props?: Parameters<T>[0] | any, ...children: Array<Node | string | Array<Node | string>>): HTMLElement;
};

type Plugins = {
    disable(id: string): void;
}

const Looks = Object.freeze({
    FILLED: "bd-button-filled",
    OUTLINED: "bd-button-outlined",
    LINK: "bd-button-link",
    BLANK: "bd-button-blank"
});
const Colors = Object.freeze({
    BRAND: "bd-button-color-brand",
    BLURPLE: "bd-button-color-blurple",
    RED: "bd-button-color-red",
    GREEN: "bd-button-color-green",
    YELLOW: "bd-button-color-yellow",
    PRIMARY: "bd-button-color-primary",
    LINK: "bd-button-color-link",
    WHITE: "bd-button-color-white",
    TRANSPARENT: "bd-button-color-transparent",
    CUSTOM: ""
});
type ButtonSizes = Readonly<{
    NONE: "",
    TINY: "bd-button-tiny",
    SMALL: "bd-button-small",
    MEDIUM: "bd-button-medium",
    LARGE: "bd-button-large",
    ICON: "bd-button-icon"
}>;

export type ButtonProps = PropsWithChildren<{
    className?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    buttonRef?: RefObject<HTMLButtonElement>;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    look?: typeof Looks[keyof typeof Looks];
    color?: typeof Colors[keyof typeof Colors];
    size?: typeof ButtonSizes[keyof typeof ButtonSizes];
    grow?: boolean;
}>;
type Components = {
    Button(props: ButtonProps): HTMLElement;
    ColorInput: any;
    DropdownInput: any;
    ErrorBoundary: any;
    Flex: any;
    KeybindInput: any;
    NumberInput: any;
    RadioInput: any;
    SearchInput: any;
    SettingGroup: any;
    SettingItem: any;
    SliderInput: any;
    SwitchInput: any;
    Text: any;
    TextInput(props: { value?: string; maxLength?: number; placeholder?: string; onKeyDown?: any; onChange?: (value: string) => void; disabled?: boolean }): HTMLElement;
    Tooltip: any;
};

type Data = {
    load<T>(pluginName: string, key: string): T | undefined;
    save<T = unknown>(pluginName: string, key: string, data: T): void;
    delete(pluginName: string, key: string): void;
};

type DOM = {
    createElement(type: string, options: { id?: string; target?: string | Element } = {}, ...children: Array<Node | string | Array<Node | string>>): HTMLElement;
    onRemoved(node: Node, callback: () => void): () => void;
    parseHTML(html: string, fragment: false = false): HTMLElement;
    parseHTML(html: string, fragment: true): DocumentFragment;
    parseHTML(html: string, fragment = false): HTMLElement | DocumentFragment;
};

type Patcher = {
    after(caller: string, moduleToPatch: Record<any, any>, functionName: string, callback: (thisObject: any, args: any, returnValue: any) => void): () => void;
    before(caller: string, moduleToPatch: Record<any, any>, functionName: string, callback: (thisObject: any, args: any) => void): () => void;
    instead(caller: string, moduleToPatch: Record<any, any>, functionName: string, callback: (thisObject: any, args: any) => void): () => void;
    unpatchAll(caller: string): void;
    getPatchesByCaller(caller: string): Function[];
};

const ModalRoot = {
    Sizes: Object.freeze({
        SMALL: "bd-modal-small",
        MEDIUM: "bd-modal-medium",
        LARGE: "bd-modal-large",
        DYNAMIC: ""
    })
};
export type ConfirmationModalOptions = PropsWithChildren<{
    onClose?(): void;
    onConfirm?(): void;
    onCancel?(): void;
    onCloseCallback?(): void;
    transitionState?: number;
    size?: typeof ModalRoot.Sizes[keyof typeof ModalRoot.Sizes];
    className?: string;
    header?: string;
    confirmText?: string;
    cancelText?: string | null;
    danger?: boolean;
    key?: string | number;
}>;
type UI = {
    buildSettingsPanel(props: { settings: SettingConfigElement[]; onChange: (category: string, id: string, value: any) => void }): HTMLElement;
    showConfirmationModal(title: string, content: (string | HTMLElement | Array<string | HTMLElement>), options: ConfirmationModalOptions = {}): string | number | void;
    showNotice(content: string, options?: { type?: 'info' | 'success' | 'warning' | 'error' = 'info'; buttons?: Array.<{ label: string, onClick: () => void }>; timeout?: number = 10000 }): () => void;
    showToast(content: string, options?: { type?: "info" | "success" | "warning" | "error" = ""; icon?: boolean; timeout?: number = 3000; forceShow?: boolean = false }): void;
};

type Utils = {
    findInTree(
        tree: Record<string | number, unknown> | null,
        searchFilter: TreeFilter | string,
        { walkable = null, ignore = [] }: { walkable?: string[] | null; ignore?: string[] } = {}
    ): any | undefined;
};

interface Require {
    <T = any>(id: PropertyKey): T;
    d(target: object, exports: Record<string, () => any>): void;
    c: Record<PropertyKey, Module>;
    m: Record<PropertyKey, RawModule>;
    e(id: PropertyKey): Promise<unknown>;
}
type Filter = (exported: any, module: Module, id: PropertyKey) => any;
interface WebpackOptions extends Options {
    first?: boolean;
}
type Options = {
    searchExports?: boolean;
    defaultExport?: boolean;
    searchDefault?: boolean;
    raw?: boolean;
};
type WithOptions<T, B extends WebpackOptions> = [...T[], B] | T[];
type Webpack = {
    Filters: any;
    getAllByKeys<T extends any[]>(...props: WithOptions<string, WebpackOptions>): T;
    getAllByRegex<T extends any[]>(regex: RegExp, options: WebpackOptions = {}): T;
    getAllByStrings<T extends any[]>(...strings: WithOptions<string, WebpackOptions>): T;
    getByPrototypeKeys<T>(...prototypes: WithOptions<string, WebpackOptions>): T;
    getAllByPrototypeKeys<T extends any[]>(...prototypes: WithOptions<string, WebpackOptions>): T;
    getByKeys<T = any>(...props: WithOptions<string, WebpackOptions>): T;
    getByStrings<T>(...strings: WithOptions<string, WebpackOptions>): T;
    getModule<T extends any>(filter: Filter, options?: WebpackOptions): T;
    getModules<T extends any[]>(filter: Filter, options: WebpackOptions = {}): T;
    getStore<T = any>(name: string): T;

    modules: Proxy<Require["m"]>;
};

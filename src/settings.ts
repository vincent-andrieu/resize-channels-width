import { SettingConfigElement } from "./types/settings";

export const NAME = "ResizeChannelsWidth";
export const LOG_PREFIX = `[${NAME}]`;
export const DEFAULT_SIDEBAR_WIDTH = 240;
export const SIDEBAR_MIN_WIDTH = 45;
export const SIDEBAR_MAX_WIDTH = 600;
export const DEFAULT_RESIZER_WIDTH = 5;
export const RESIZER_MIN_WIDTH = 1;
export const RESIZER_MAX_WIDTH = 20;

export const SETTING_SIDEBAR_WIDTH = "sidebarWidth";
export const SETTING_DEFAULT_SIDEBAR_WIDTH = "defaultSidebarWidth";
export const SETTING_RESIZER_WIDTH = "resizerWidth";

export function getConfig(): {
    name: string;
    settings: Array<SettingConfigElement>;
} {
    return {
        name: NAME,
        settings: [
            {
                type: "number",
                id: SETTING_DEFAULT_SIDEBAR_WIDTH,
                name: "Default sidebar width",
                note: "240px by default",
                value: BdApi.Data.load<number>(NAME, SETTING_DEFAULT_SIDEBAR_WIDTH) || DEFAULT_SIDEBAR_WIDTH,
                defaultValue: DEFAULT_SIDEBAR_WIDTH,
                min: SIDEBAR_MIN_WIDTH,
                max: SIDEBAR_MAX_WIDTH
            },
            {
                type: "number",
                id: SETTING_RESIZER_WIDTH,
                name: "Resizer width",
                note: `Width of the sidebar right border to resize it (${DEFAULT_RESIZER_WIDTH}px by default)`,
                value: BdApi.Data.load<number>(NAME, SETTING_RESIZER_WIDTH) || DEFAULT_RESIZER_WIDTH,
                defaultValue: DEFAULT_RESIZER_WIDTH,
                min: RESIZER_MIN_WIDTH,
                max: RESIZER_MAX_WIDTH
            }
        ]
    };
}

export function getSetting<T>(id: string, settingsList: Array<SettingConfigElement> = getConfig().settings): Readonly<T | undefined> {
    for (const setting of settingsList) {
        if (setting.type === "category") {
            const result = getSetting<T>(id, setting.settings);

            if (result !== undefined) {
                return result;
            }
        } else if (setting.id === id) {
            return setting.value as T;
        }
    }
    return undefined;
}

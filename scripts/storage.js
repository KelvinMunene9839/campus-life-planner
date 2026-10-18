const RECORDS_KEY = "campus-planner-records";
const SETTINGS_KEY = "campus-planner-settings";
const DEFAULT_SETTINGS = {cap: 0, theme: "light"};

function read(key, fallback) {
    try{
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch(error){
        return fallback;
    }
}

function write(key, value) {
    try{
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    }catch(error){
        return false;
    }
}
export function loadRecords() {
    const records = read(RECORDS_KEY, []);
    return Array.isArray(records) ? records : [];
}

export function saveRecords(records) {
    return write(RECORDS_KEY, records);
}

export function loadSettings() {
    return {...DEFAULT_SETTINGS, ...read(SETTINGS_KEY, {})};
}

export function saveSettings(settings) {
    return write(SETTINGS_KEY, settings);
}
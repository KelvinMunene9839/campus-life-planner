import {loadRecords, saveRecords, loadSettings, saveSettings} from "./storage.js";
import {validateRecord, isValidRecord} from "./validators.js";
import {dataString, MakeId} from "./utils.js";

export const state = {
    records: loadRecords(),
    settings: loadSettings(),
    sortKey: "dueDate",
    sortDirection:1,
    editingId:null,
    query:"",
    caseSensitive: false,
    lastSaveOk: true,
};

function persistRecords() {
    state.lastSaveOk = saveRecords(state.records);
}

function persistSettings() {
    state.lastSaveOk = saveSettings(state.settings);
}

function clean(data){
    return{
        title: String(data.title ?? "").trim().replace(/\s+/g, " "),
        dueDate: String(data.dueDate ?? "").trim(),
        duration: Math.max(0, parseInt(data.duration, 10) || 0),
        tag: String(data.tag ?? "").trim(),
        notes: String(data.notes ?? "").trim(),
    };
}

export function getRecord(id){
    return state.records.find((record) => record.id === id);
}

export function addRecord(data){
    const now = new Date().toISOString();
    state.records.push({
        ...clean(data),
        id: MakeId(),
        createdAt: now,
        updatedAt: now,
    });
    persistRecords();
}

export function updateRecord(id, data){
    const record = getRecord(id);
    if(!record) return false;
    Object.assign(record, clean(data),{ updatedAt: new Date().toISOString()});
    persistRecords();
    return true;
}

export function deleteRecord(id){
    const before = state.records.length;
    state.records = state.records.filter((record) => record.id !== id);
    if(state.editingId === id) state.editingId = null;
    persistRecords();
    return state.records.length < before;
}

export function importRecords(list){
    if(!Array.isArray(list)) throw new Error("Invalid data format: expected an array of records.");
    let added = 0;
    list.forEach((item) =>{
        if (item && typeof item === "object" && isValidRecord(item)){
            const now = new Date().toISOString();
            const createdAt = item.createdAt || now;
            const updatedAt = item.updatedAt || createdAt;
            state.records.push({...clean(item), id: MakeId(), createdAt, updatedAt});
            added++;
        }
    });
    persistRecords();
    return added;
}

export function addExamples(){
    const examples = [
        ["study session at library", 1, 90, "study", "ROOM 101", 0],
        ["team meeting", 2, 60, "meeting", "ROOM 202", 0],
        ["project presentation", 3, 120, "presentation", "ROOM 303", 0],
        ["lab experiment", 4, 180, "experiment", "ROOM 404", 0],
        ["guest lecture", 5, 60, "lecture", "ROOM 505", 0],
        ["Calculus III Midterm Prep", 1, 120, "exam-prep", "Science Library Study Pod B", 0],
        ["Computer Science Group Sprint", 2, 90, "project", "Engineering Building Room 402", 0],
        ["Physics Lab Report Drafting", 3, 45, "assignment", "Student Union Center Desk", 0],
        ["Biology Research Experiment", 4, 150, "lab", "Life Sciences Complex Lab 108", 0],
        ["Career Center Resume Workshop", 5, 60, "workshop", "Student Services Center Room 210", 0],
    ];
    examples.forEach(([title, dueIn, duration, tag, notes, createdAgo]) => {
        const now = new Date().toISOString();
        state.records.push({
            ...clean({title, dueDate : dataString(dueIn),duration, tag, notes }),
            id: MakeId(),
            createdAt: dataString(createdAgo),
            updatedAt: now,
        });
    });
    persistRecords();
}

export function setEditing(id){
    state.editingId = id;
}

export function setSort(key){
    if(state.sortKey === key){
        state.sortDirection *= -1;
    }else{
        state.sortKey = key;
        state.sortDirection = 1;
    }
}

export function setQuery(query, caseSensitive ){
    state.query = query;
    state.caseSensitive = caseSensitive;
}

export function setCap(minutes){
    const cap = Number(minutes);
    state.settings.cap = Number.isFinite(cap) && cap > 0 ? Math.round(cap) : 0;
    persistSettings();
}

export function toggleTheme(){
    state.settings.theme = state.settings.theme === "light" ? "dark" : "light";
    persistSettings();
}

export function getStats(){
    const tagCounts = {};
    let totalMinutes = 0;
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    let weekCount = 0;
    let weekMinutes = 0;

    state.records.forEach((record) => {
        totalMinutes += Number(record.duration) || 0;
        if (record.tag) tagCounts[record.tag] = (tagCounts[record.tag] || 0) + 1;

        const due = new Date(record.dueDate);
        if (due >= today && due <= nextWeek) {
            weekCount++;
            weekMinutes += Number(record.duration) || 0;
        }
    });

    const topTag = Object.keys(tagCounts).sort((a, b) => tagCounts[b] > tagCounts[a])?.[0] || "-";

    return {
        total: state.records.length,
        totalMinutes,
        topTag,
        weekCount,
        weekMinutes,
    };
}
export {validateRecord};
 


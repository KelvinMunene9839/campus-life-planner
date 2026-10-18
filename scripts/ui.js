import{state, getStats} from './state.js';
import {getVisibleRecords} from "./search.js";
import {dataString} from "./utils.js";

const $ = (id) => document.getElementById(id);

export const el = {
    form: $("record-form"), title: $("title"), dueDate: $("due-date"), 
    duration: $("duration"), tag: $("tag"), notes: $("notes"),
   editor: $("editor"), editorTitle: $("editor-title"),
   saveButton: $("save-button"), cancelEdit: $("cancel-edit"),
   tbody: document.querySelector(".records-body"), 
   emptyState: $("empty-state"),
    search: $("search-input"), searchInput: $("search-input"), caseToggle: $("case-toggle"), searchError: $("search-error"),
    sortButtons: document.querySelectorAll(".sort-button"),
    capInput: $("cap-input"), capSave: $("cap-save"), capMessage: $("cap-message"),
    statTotal: $("stat-total"), statMinutes: $("stat-minutes"), statTag: $("stat-tag"),
    trendChart: $("trend-chart"), unitPreview: $("unit-preview"), themeToggle: $("theme-toggle"),
    status: $("app-status"), seedButton: $("seed-button"),
    exportJson: $("export-json"), exportCsv: $("export-csv"), importFile: $("import-json"),
};

const fieldInputs = {
    title: el.title, dueDate: el.dueDate, duration: el.duration, tag: el.tag, notes: el.notes,
};

function makeCell(text) {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
}

function makeHighlightedCell(text, query, caseSensitive) {
    const td = document.createElement("td");
    td.appendChild(highlightText(String(text), query, caseSensitive));
    return td;
}

function makeButton(label, action, record){
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-ghost";
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.id = record.id;
    button.setAttribute("aria-label", `${label}  ${record.title}`);
    return button;
}

function makeRow(record, query, caseSensitive){
    const tagQuery = query.startsWith("^@tag:") ? query.slice(6) : query;
    const tr = document.createElement("tr");
    tr.append(
        makeHighlightedCell(record.title, query, caseSensitive),
        makeHighlightedCell(record.dueDate, query, caseSensitive),
        makeHighlightedCell(`${record.duration} min`, query, caseSensitive),
        makeHighlightedCell(record.tag, tagQuery, caseSensitive),
        
    );

    const actions = document.createElement("td");
    actions.append(
        makeButton("Edit", "edit", record),
        makeButton("Delete", "delete", record)
    );
    tr.append(actions);
    return tr;
}

export function renderTable(){
    const {list, errors} = getVisibleRecords(state);
    el.searchError.textContent = errors;
    el.tbody.replaceChildren(...list.map((record) => makeRow(record, state.query, state.caseSensitive)));
    el.emptyState.hidden = list.length >0;
    el.emptyState.textContent = state.records.length
        ? "No records match the search query."
        : "No records available. Please add a record.";

    el.sortButtons.forEach((button) => {
    const th = button.closest("th");
    if (button.dataset.sort === state.sortKey) {
      th.setAttribute("aria-sort", state.sortDirection === 1 ? "ascending" : "descending");
    } else {
      th.removeAttribute("aria-sort");
    }
  });
}

function renderStats(){
    const stats = getStats();
    el.statTotal.textContent = stats.total;
    el.statMinutes.textContent = stats.totalMinutes;
    el.statTag.textContent = stats.topTag;
    if (document.getElementById("stat-week")) document.getElementById("stat-week").textContent = stats.weekCount;
    el.unitPreview.textContent = `${stats.weekMinutes} minutes = ${(
stats.weekMinutes / 60).toFixed(2)} hours`;
}

function renderTrend(){
    const days = [];
    for (let i = 6; i >= 0; i--) days.push(dataString(-i));
    const counts = days.map((day) => state.records.filter((r) => r.createdAt === day).length);
    const max = Math.max(...counts, 1);

    const bars = days.map((day, i) => {
        const wrap= document.createElement("div");
        wrap.className = "bar-wrap";
        const number = document.createElement("span");
        number.textContent = counts[i];
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = `${(counts[i] / max) * 100}%`;
       const label = document.createElement("small");
       label.textContent = day.slice(5);
       wrap.append(number, bar, label);
       return wrap;
    });
    el.trendChart.replaceChildren(...bars);
}

function renderCap(){
    const cap = Number(state.settings.cap) || 0;
    if(!cap){
        el.capMessage.textContent = "Set a target to manage study strain.";
        el.capMessage.classList.remove("over");
        return;
    }
    if(cap){
        const planned = getStats().weekMinutes;
        el.capMessage.textContent = planned <= cap
            ? `${planned} of ${cap} minutes planned this week. ${cap - planned} minutes remaining.`
            : `${planned} of ${cap} minutes planned this week. You have exceeded your target by ${planned - cap} minutes.`;
        el.capMessage.classList.toggle("over", planned > cap);
        el.capMessage.setAttribute("aria-live", "polite");
        return;
    }

}

export function renderTheme(){
    const isDark = state.settings.theme === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    el.themeToggle.textContent = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    el.themeToggle.setAttribute("aria-label", String(isDark));
}

export function renderAll(){
    renderTable();
    renderStats();
    renderCap();
    renderTheme();
    renderTrend();

}

export function readForm(){
    return {
        title: el.title.value,
     dueDate: el.dueDate.value,
     duration: el.duration.value,
     tag: el.tag.value,
     notes: el.notes.value,
    };
}

export function showFieldErrors(errors){
    let firstErrorField = null;
    document.querySelectorAll(".field-error").forEach((p) => {
        const message = errors[p.dataset.error] || "";
        const input = fieldInputs[p.dataset.error];

        p.textContent = message;
        if(message){
            if(input) input.setAttribute("aria-invalid", "true");
            firstErrorField = firstErrorField || input;
        }else{
            if(input) input.removeAttribute("aria-invalid");
        }
    });
    if(firstErrorField) firstErrorField.focus();
}

export function fillForm(record){
    showFieldErrors({});
    el.title.value = record.title;
    el.dueDate.value = record.dueDate;
    el.duration.value = record.duration;
    el.tag.value = record.tag;
    el.notes.value = record.notes;
    el.editorTitle.textContent = "Edit Record";
    el.saveButton.textContent = "Update Record";
    el.cancelEdit.hidden = false;
    el.editor.scrollIntoView({behavior: "smooth"});
    el.title.focus();
}
export function resetForm(){
    el.form.reset();
    showFieldErrors({});
    el.editorTitle.textContent = "Add New Record";
    el.saveButton.textContent = "Save Record";
    el.cancelEdit.hidden = true;
}

export function showStatus(message){
    el.status.textContent = message;
}

export function downloadFile(filename,text, type){
    const url = URL.createObjectURL(new Blob([text], {type}));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
export function highlightText(text, query, caseSensitive){
    if(!query) return document.createTextNode(text);

    try{
        const regex = new RegExp(query, caseSensitive ? "g" : "gi");
        const fragment = document.createDocumentFragment();
        let cursor = 0;
        let match;
        while((match = regex.exec(text))){
            fragment.appendChild(document.createTextNode(text.slice(cursor, match.index)));
            const mark = document.createElement("mark");
            mark.textContent = match[0];
            fragment.appendChild(mark);
            cursor = match.index + match[0].length;
            if(match[0] === "") regex.lastIndex++;
        }
        fragment.appendChild(document.createTextNode(text.slice(cursor)));
        return fragment;
    } catch (e){
        return document.createTextNode(text);
    }
}
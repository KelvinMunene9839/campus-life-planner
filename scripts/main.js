import {
    state, getRecord, addRecord, updateRecord, deleteRecord, importRecords, addExamples,
    setEditing, setSort, setQuery, setCap, toggleTheme, validateRecord,
} from "./state.js";
import { el, renderAll, renderTable, renderTheme, readForm, showFieldErrors, fillForm ,resetForm, showStatus, downloadFile} from "./ui.js";

function finish(message){
    renderAll();
    showStatus(state.lastSaveOk ? message : "Error saving data to local storage.");
}

function stopEditing(){
    setEditing(null);
    resetForm();
    
}

el.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readForm();
    const errors = validateRecord(data);
    showFieldErrors(errors);
    if(Object.keys(errors).length === 0){
        if(state.editingId){
            const found = updateRecord(state.editingId, data);
            stopEditing();
            finish(found ? "Record updated." : "Error: Record not found.");
        }else{
            addRecord(data);
            stopEditing();
            finish("Record added.");
        }
    }
});

el.cancelEdit.addEventListener("click", () => {
    stopEditing();
    showStatus("Edit cancelled.");
});

el.tbody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if(!button) return;
    const record = getRecord(button.dataset.id);
    if(!record) return;

if(button.dataset.action === "edit"){
    setEditing(record.id);
    fillForm(record);
}
if(button.dataset.action === "delete"){
    if(!confirm(`Delete record "${record.title}"?`)) return;
    const wasEditing = state.editingId === record.id;
    deleteRecord(record.id);
    if(wasEditing) resetForm();
    finish("Record deleted.");
}
});
el.sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setSort(button.dataset.sort);
        renderTable();
    });
});
function onSearchChange(){
    setQuery(el.searchInput.value, el.caseToggle.checked);
    renderTable();
}

el.searchInput.addEventListener("input", onSearchChange);
el.caseToggle.addEventListener("change", onSearchChange);

function saveTarget(){
    setCap(el.capInput.value);
    finish(state.settings.cap ? "Settings saved." : "Settings cleared.");
}

el.capSave.addEventListener("click", saveTarget);
el.capInput.addEventListener("keydown", (event) => {
    if(event.key === "Enter") saveTarget();
});

el.exportJson.addEventListener("click", () => {
    if(state.records.length === 0) return showStatus("No records to export.");
    downloadFile("campus-planner-records.json", JSON.stringify(state.records, null, 2), "application/json");
    showStatus("Records exported as JSON.");
});

el.exportCsv.addEventListener("click", () => {
    if(state.records.length === 0) return showStatus("No records to export.");
    const headers = ["id", "title", "dueDate", "duration", "tag", "notes", "createdAt", "updatedAt"];
    const rows = state.records.map((record) => headers.map((header) => csvCell(record[header])).join(","));
    downloadFile("campus-planner-records.csv", [headers.join(","), ...rows].join("\r\n"), "text/csv");
    showStatus("Records exported as CSV.");
});

function csvCell(value){
    let text = String(value ?? "");
    if(/^[=+\-@]/.test(text)) text = `"${text}"`;
    return `"${text.replace(/"/g, '""')}"`;
}

el.importFile.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if(!file) return;
 try{
    if(file.size > 2 * 1024 * 1024) throw new Error("File size exceeds 2MB limit.");
    const list = JSON.parse(await file.text());
    const added = importRecords(list);
     finish(`Imported ${added} of ${list.length} records.`);
 } catch(error){
     showStatus("Import failed: choose a JSON file exported from this app." );
 }
  event.target.value = "";
});

el.seedButton.addEventListener("click", () => {
    addExamples();
    finish("Example records added.");
});

el.themeToggle.addEventListener("click", () => {
    toggleTheme();
    renderTheme();
    
});

el.form.addEventListener("keydown", (event) => {
    if(event.key === "Escape" && state.editingId){
        stopEditing();
        showStatus("Edit cancelled.");
    }
});
// Single-Page View Switching Router
function handleRouting() {
    // Get page hash from URL, defaulting to #dashboard
    const hash = window.location.hash || "#dashboard";
    const targetSection = document.getElementById(hash.slice(1));

    if (targetSection) {
        // Hide all sections and show target section
        document.querySelectorAll(".dashboard-main > section").forEach((section) => {
            section.classList.remove("active-page");
        });
        targetSection.classList.add("active-page");

        // Update active navigation link styles
        document.querySelectorAll(".nav-link").forEach((link) => {
            if (link.getAttribute("href") === hash) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        // Scroll top on page switch
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// Listen for route changes and initial page load
window.addEventListener("hashchange", handleRouting);
window.addEventListener("DOMContentLoaded", handleRouting);

renderAll();
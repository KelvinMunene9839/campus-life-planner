# 🎓 Campus Life Planner

A lightweight, accessible, offline-first client-side web application built with vanilla JavaScript, semantic HTML, and mobile-first CSS. Designed for students to organize assignments, study blocks, and campus activities with live regular expression searching, workload target tracking, and full data portability.

---

## 📌 Chosen Theme
* **Theme Name:** Campus Life Planner
* **Target Audience:** College and university students managing academic schedules, library sessions, group projects, and personal tasks.
* **Primary Metrics:** Due dates, task duration (minutes), and activity tags.

---

## ✨ Features List

* **Interactive Dashboard:**
  * Metric cards displaying total records, total planned minutes, top tag, and 7-day workload.
  * Seven-day activity bar chart visualizer tracking creation trends.
  * **Weekly Duration Target:** Set custom weekly target caps with real-time ARIA status feedback.
* **Records Table & Search:**
  * Multi-column bidirectional sorting (Title, Due Date, Duration).
  * Safe **Live Regex Search** supporting query syntax (e.g., `^@tag:study` or `12:30`) with case-sensitivity toggling.
  * Accessible search match highlighting using `<mark>` tags without XSS exposure.
* **Input Validation & Sanitization:**
  * Input forms protected by strict client-side regular expressions.
  * Catches repeated consecutive words using advanced regex back-references.
  * Trims whitespace and collapses double spaces automatically.
* **Data Persistence & Portability:**
  * Automatic `localStorage` synchronization.
  * Export options for JSON and CSV file formats.
  * JSON import parser with schema verification to prevent corrupted state ingestion.
* **Theme Preferences:**
  * Custom CSS property-driven Dark/Light mode toggle with persistence.

---

## 🔍 Regex Catalog

| Field / Purpose | Regular Expression | Description & Rules | Valid Examples | Invalid Examples |
| :--- | :--- | :--- | :--- | :--- |
| **Title / Description** | `/^\S(?:.*\S)?$/` | Non-empty string; forbids leading/trailing whitespace. | `"Study at library"` | `" Study "`, `""` |
| **Repeated Word Check** | `/\b(\w+)\s+\1\b/i` | Advanced back-reference rule checking for duplicated words. | `"Math Exam prep"` | `"Math Math prep"` |
| **Duration (Numeric)** | `/^(0\|[1-9]\d{0,4})$/` | Non-negative integer up to 99,999 minutes. | `"0"`, `"120"` | `"-15"`, `"1.5"`, `"100000"` |
| **Due Date** | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | Standard ISO date format (YYYY-MM-DD). | `"2026-10-25"` | `"25-10-2026"`, `"2026-02-31"` |
| **Category / Tag** | `/^[A-Za-z]+(?:[-][A-Za-z]+)*$/` | Alphabetical characters and hyphens only. | `"study"`, `"lab-work"` | `"study 101"`, `"tag@#"` |
| **Search Tag Filtering** | `/^@tag:(\w+)/` | Quick prefix pattern for searching by tag in live search. | `"^@tag:study"` | `"tag=study"` |

---

## ⌨️ Keyboard Map

| Key / Shortcut | Context / Element | Action |
| :--- | :--- | :--- |
| <kbd>Tab</kbd> | Global | Navigate forward through interactive controls, inputs, and links. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Global | Navigate backward through interactive controls. |
| <kbd>Enter</kbd> | Skip Link | Instantly jump keyboard focus to `#main-content`. |
| <kbd>Enter</kbd> | Buttons & Headers | Trigger action or toggle table column sort direction. |
| <kbd>Enter</kbd> | Target Input | Save weekly target cap settings when focused inside `#cap-input`. |
| <kbd>Space</kbd> | Checkbox / Toggle | Toggle case-sensitivity check or trigger theme switcher button. |
| <kbd>Esc</kbd> | Form Controls | Cancel current record editing state and return to standard form mode. |

---

## ♿ Accessibility (A11y) Notes

* **Semantic Landmarks:** Full structure built with `<header>`, `<nav>`, `<main>`, `<section>`, and `<footer>` elements.
* **Focus Management:**
  * High-contrast focus outlines configured via `:focus-visible` CSS rules.
  * A top-level skip-to-content link allows keyboard users to bypass primary navigation.
  * Form field errors automatically focus the first invalid input element upon submission.
* **ARIA Live Regions:**
  * App status bar uses `aria-live="polite"` for non-disruptive feedback.
  * Target duration messages dynamically switch between `aria-live="polite"` (under budget) and `aria-live="assertive"` / `role="alert"` (over budget).
  * Form input errors linked dynamically using `aria-invalid` and `data-error` labels.
* **Responsive Layout:**
  * Mobile-first styling tested across 360px, 768px, and 1024px breakpoints.
  * Table elements wrapped in an auto-overflow container to prevent body clipping on touch devices.

---

## 🧪 How to Run Tests

This project includes a dedicated browser-based unit test suite (`tests.html`) testing validation functions, date parsers, and regular expressions.

1. Start a local HTTP server in the project root folder:
   ```bash
   python3 -m http.server 8000
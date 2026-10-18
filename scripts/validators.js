const rules = {
    title: /^\S(?:.*\S)?$/,
    dueDate: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    duration: /^(0|[1-9]\d{0,4})$/,
    tag: /^[A-Za-z]+(?:[-][A-Za-z]+)*$/,
}

const repeatedWord = /\b(\w+)\s+\1\b/i;

function isRealDate(text){
   const[year, month, day] = text.split('-').map(Number);
   const date = new Date(year, month - 1, day);
   return date.getMonth() === month - 1 && date.getDate() === day;
}

export function validateRecord(data){
    const title = String(data.title ?? "");
    const dueDate = String(data.dueDate ?? "").trim();
    const duration = String(data.duration ?? "").trim();
    const tag = String(data.tag ?? "");
    const notes = String(data.notes ?? "").trim();
    const errors = {};

    if(!rules.title.test(title) || title.length > 100){
        errors.title = "Title must be non-empty without leading/trailing spaces.";
    }else if(repeatedWord.test(title)){
        errors.title = "Title must not contain repeated words.";
    }

    if(!rules.dueDate.test(dueDate) || !isRealDate(dueDate)){
        errors.dueDate = "Due date must be a valid date in YYYY-MM-DD format.";
    }

    if(!rules.duration.test(duration)) {
    errors.duration = "Duration must be a non-negative integer.";
    }
    if(!rules.tag.test(tag)){
        errors.tag = "Tag must contain letters and hyphens only.";
    }
    if (notes.length > 500){
        errors.notes = "Notes must be less than or equal to 500 characters.";
    }

    return errors;
}


export function isValidRecord (data){
    return Object.keys(validateRecord(data)).length === 0;
}
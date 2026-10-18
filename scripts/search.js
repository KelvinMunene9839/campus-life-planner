function searchText(Record){
    return `@tag:${Record.tag} @title:${Record.title} @notes:${Record.notes}`;
}

function compare(key){
    return (a, b) => {
        if (typeof a[key] === "number") return a[key] - b[key];
        return String(a[key]).localeCompare(String(b[key]), undefined, {sensitivity: "base"});
    };
}

export function getVisibleRecords({records, query, caseSensitive, sortKey, sortDirection}){
    let list = [...records];
    let errors = "";
try{
    if (query){
        const regex = new RegExp(query, caseSensitive ? "" : "i");
        list = list.filter((record) => regex.test(searchText(record)));
    }
} catch (e){
        errors = "Invalid search query.";
    }

    const compareFn = compare(sortKey);
    list.sort((a, b) => sortDirection * compareFn(a, b));

    return {list, errors};
}

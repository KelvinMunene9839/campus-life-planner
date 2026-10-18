export function dataString(offset=0) {

    const d = new Date();
    d.setDate(d.getDate() + offset);

    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${d.getFullYear()}-${month}-${day}`;
}
//returns unique id for each record
export function MakeId(){
    if(typeof crypto !== 'undefined' && crypto.randomUUID)
        return crypto.randomUUID();
        return '${Date.now()}-${Math.random().toString(16).slice(2)}';
    
} 
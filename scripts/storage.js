const storage = {
    get: function(key, defaultValue = null) {
        try { return localStorage.getItem(key) || defaultValue; } 
        catch (e) { return defaultValue; }
    },
    getJSON: function(key, defaultValue = {}) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) { return defaultValue; }
    },
    set: function(key, value) {
        try { localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value); } 
        catch (e) { console.error(`[Storage Error] Переполнение.`, e); }
    }
};

const DIFF_NAMES = { 0: 'ЛЕГКО', 1: 'НОРМА', 2: 'СЛОЖНО', 3: 'ОЧЕНЬ СЛОЖНО' };
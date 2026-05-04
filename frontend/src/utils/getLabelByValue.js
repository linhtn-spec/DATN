export function getLabelByValue(value, array) {
    const result = array.find(item => item.value == value);
    return result ? result.label : null;
}
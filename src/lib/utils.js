/**
 * Formats a number with thousand separators.
 * @param {number} value - The number to format.
 * @returns {string} - The formatted number with commas.
 */
export function formatNumber(value) {
    if (typeof value !== 'number') {
      return value; // Return the value as-is if it's not a number
    }
    return value.toLocaleString('en-US'); // Format the number with commas
  }


export function formatFieldNames(fieldName) {
    
      if (fieldName.includes('_')) {
        const words = fieldName.split(/[\/]/);
        const sections = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('/');
        const words_only = sections.split('_');
        return words_only.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      } else {
        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      };
  }
  
  // const input = [
  //   "id",
  //   "code",
  //   "name",
  //   "description",
  //   "parent_category"
  // ];
  
  // const output = formatFieldNames(input);
  // console.log(output); // Output: [ 'Id', 'Code', 'Name', 'Description', 'Parent Category' ]

  

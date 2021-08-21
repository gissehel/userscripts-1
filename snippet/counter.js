/**
 * Create a counter generator starting from "start" using a "step"
 * @param {number} start 
 * @param {number} step
 */
const counter = function* (start, step) {
    let value = start;
    while (true) { 
        yield value; 
        value+=step; 
    } 
}

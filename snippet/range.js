/**
 * Create a generator to simulate a range of numbers
 * @param {number} start The first value of the range
 * @param {number?} stop The stop value of the range (if any)
 * @param {number?} step The step to use (if any)
 * @returns 
 */
const range = function* (start, stop, step) {
    let cond = null;
    if (stop === undefined) {
        if (step === undefined) {
            stop = start
            start = 0
        } else {
            cond = () => true;
        }
    }
    if (step === undefined) { 
        if (start<stop) { 
            step = 1; 
        } else if (stop<start) { 
            step = -1;
        } 
    }
    if (!cond) {
        if (step > 0) {
            cond = (i) => i<stop;
        } else if (step < 0) {
            cond = (i) => i>stop;
        } else {
            return;
        }
    }
    let i=start; 
    while (step > 0 ? i<stop : i>stop ) { 
        yield i; 
        i+=step; 
    } 
}

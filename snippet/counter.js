const counter = function* (start, step) {
    let value = start;
    while (true) { 
        yield value; 
        value+=step; 
    } 
}

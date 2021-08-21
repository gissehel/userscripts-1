const GeneratorProto = Object.getPrototypeOf(function* () { }).prototype;
const ArrayProto = Object.getPrototypeOf([]);
GeneratorProto.map = function* (mapper) {
    let count = 0;
    for (const val of this) {
        yield mapper(val, count);
        count += 1;
    }
};
GeneratorProto.filter = function* (func) {
    let count = 0;
    for (const val of this) {
        if (func(val, count)) {
            yield val;
        }
        count += 1;
    }
};
GeneratorProto.reduce = function (reducer, acc) {
    if (acc === undefined) {
        const nextIterator = this.next();
        if (nextIterator.done) {
            throw new TypeError('Reduce of empty generator with no initial value');
        }
        acc = nextIterator.value;
    }
    for (const val of this) {
        acc = reducer(acc, val);
    }
    return acc
};
GeneratorProto.slice = function* (start, end) {
    if ((start !== undefined && start < 0) || (end !== undefined && end < 0)) {
        throw new TypeError("Can't use negative indexes in slice for Generators");
    }
    let count = 0;
    for (const val of this) {
        if (end !== undefined && count >= end) {
            return;
        }
        if (start === undefined || count >= start) {
            yield val;
        }
        count += 1;
    }
};
GeneratorProto.forEach = function (func) {
    let count = 0;
    for (const val of this) {
        func(val, count);
        count += 1;
    }
};
GeneratorProto.chain = function* (...iterators) {
    yield* this;
    for (const iterator of iterators) {
        yield* iterator;
    }
};
GeneratorProto.toArray = function () {
    return [...this];
};
ArrayProto.cycle = function* (n) {
    let cycleCount = 0;
    while ((n === undefined) || (cycleCount<n)) {
        yield* this;
        cycleCount += 1;
    }
};
ArrayProto.toIterator = function* () {
    yield* this;
}

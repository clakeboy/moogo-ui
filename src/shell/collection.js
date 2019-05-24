export class Collection {
    constructor(name) {
        this.collection_name = name;
        this._filter = {};
        this._sort = {};
        this._skip = 0;
        this._limit = 0;
    }

    count(filter) {
        this._filter = filter;
    }

    skip(num) {
        this._skip = num;
    }

    limit(num) {
        this._limit = num;
    }

    find(filter) {
        this._filter = filter;
    }

    sort(sort) {
        this._sort = sort;
    }
}

export function ObjectId(hex) {
    return {
        "$oid":hex
    };
}
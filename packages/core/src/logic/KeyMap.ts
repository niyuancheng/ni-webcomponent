export class KeyMap<Constructor_, Key, Value> {
    private map: Map<Constructor_, Map<Key, Value>> = new Map();

    get(constructor: Constructor_, key: Key): Value | null {
        let subMap: Map<Key, Value>;
        if(this.map.has(constructor)) {
            subMap = this.map.get(constructor)!;
            if(subMap.has(key)) {
                return subMap.get(key);
            }
        }
        return null;
    }

    set(constructor: Constructor_, key: Key, value: Value) {
        let subMap:  Map<Key, Value>;
        if(this.map.has(constructor)) {
            subMap = this.map.get(constructor)!;
        } else {
            subMap = new Map();
            this.map.set(constructor, subMap);
        }
        subMap.set(key, value);
    }

    forEach(cb: (constructor: Constructor_, key: Key, value: Value) => void) {
        this.map.forEach((subMap: Map<Key, Value>, constructor: Constructor_) => {
            subMap.forEach((value: Value, key: Key) => {
                cb(constructor, key, value);
            })
        })
    }
}
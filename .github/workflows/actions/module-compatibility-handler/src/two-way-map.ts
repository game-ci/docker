export class TwoWayMap {
  map: Map<any, any>;
  reverseMap: Map<any, any>;
  constructor(map: Map<any, any>) {
    this.map = map;
    this.reverseMap = new Map<any, any>();
    for (const key in map) {
      const value = map.get(key);
      this.reverseMap.set(key, value);
    }
  }
  get(key) {
    return this.map.get(key);
  }
  revGet(key) {
    return this.reverseMap.get(key);
  }
  has(key) {
    return this.map.has(key);
  }
  revHas(key) {
    return this.reverseMap.has(key);
  }
}

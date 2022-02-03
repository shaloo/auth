export class LocalStore {
  constructor(public name: string) {}

  public get<T>(key: string): T | null {
    const value = localStorage.getItem(this.taggedKey(key));
    return value ? JSON.parse(value) : null;
  }

  public set<T>(key: string, value: T): void {
    const val = JSON.stringify(value);
    localStorage.setItem(this.taggedKey(key), val);
  }

  public delete(key: string): void {
    localStorage.removeItem(this.taggedKey(key));
  }

  private taggedKey(key: string) {
    return `${this.name}:${key}`;
  }
}

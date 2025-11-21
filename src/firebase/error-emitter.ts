import { EventEmitter } from 'events';

// Since we're in a browser environment that might not have a global EventEmitter,
// we'll create a simple one. This is a very basic implementation.
class SimpleEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
    }
  }

  off(event: string, listener: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }
  }
}


// Use a browser-compatible EventEmitter. A simple custom one or a library would work.
// For simplicity, a basic event emitter.
export const errorEmitter = new SimpleEventEmitter();

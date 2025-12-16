import { describe, it, expect } from 'vitest';
import { calculateTotal } from './calculateTotal';

describe('calculateTotal', () => {
  it('should return 0 for empty string', () => {
    expect(calculateTotal('')).toBe(0);
  });

  it('should calculate total for comma-separated values', () => {
    expect(calculateTotal('10,20,30')).toBe(60);
  });

  it('should calculate total for newline-separated values', () => {
    expect(calculateTotal('10\n20\n30')).toBe(60);
  });

  it('should calculate total for mixed comma and newline separators', () => {
    expect(calculateTotal('10,20\n30,40')).toBe(100);
  });

  it('should handle decimal numbers', () => {
    expect(calculateTotal('10.5,20.25,30.75')).toBe(61.5);
  });

  it('should trim whitespace around numbers', () => {
    expect(calculateTotal('  10  ,  20  ,  30  ')).toBe(60);
  });

  it('should ignore empty strings after splitting', () => {
    expect(calculateTotal('10,,20,,,30')).toBe(60);
  });

  it('should filter out invalid numbers (NaN)', () => {
    expect(calculateTotal('10,abc,20,xyz,30')).toBe(60);
  });

  it('should handle negative numbers', () => {
    expect(calculateTotal('-10,20,-30')).toBe(-20);
  });

  it('should handle a single number', () => {
    expect(calculateTotal('42')).toBe(42);
  });

  it('should handle zero values', () => {
    expect(calculateTotal('0,0,0')).toBe(0);
  });

  it('should handle mixed valid and invalid inputs', () => {
    expect(calculateTotal('10.5, invalid, 20, , 30.5')).toBe(61);
  });

  it('should handle strings with only commas', () => {
    expect(calculateTotal(',,,')).toBe(0);
  });

  it('should handle strings with only newlines', () => {
    expect(calculateTotal('\n\n\n')).toBe(0);
  });

  it('should handle complex mixed format', () => {
    expect(calculateTotal('10.5 , 20\n30.25,  ,40\n\n50')).toBe(150.75);
  });
});
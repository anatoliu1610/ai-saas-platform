import { cn, formatDate, truncate, slugify, generateApiKey } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar');
      expect(result).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const result = cn('foo', false && 'bar', 'baz');
      expect(result).toBe('foo baz');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const result = truncate('hello world', 5);
      expect(result).toBe('hello...');
    });

    it('should not truncate short strings', () => {
      const result = truncate('hello', 10);
      expect(result).toBe('hello');
    });
  });

  describe('slugify', () => {
    it('should convert to slug format', () => {
      const result = slugify('Hello World!');
      expect(result).toBe('hello-world');
    });
  });

  describe('generateApiKey', () => {
    it('should generate key with prefix', () => {
      const result = generateApiKey();
      expect(result).toMatch(/^aisaas_[a-z0-9]+$/);
    });
  });
});

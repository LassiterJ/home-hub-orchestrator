import { describe, expect, it } from 'vitest';
import {
  createDefaultField,
  createDefaultSchema,
  FieldType
} from '../form-schema';

describe('Form Schema', () => {
  describe('createDefaultSchema', () => {
    it('should create a valid default schema', () => {
      const schema = createDefaultSchema();

      expect(schema).toHaveProperty('schemaVersion', '1.0.0');
      expect(schema).toHaveProperty('id');
      expect(schema).toHaveProperty('title', 'Untitled Form');
      expect(schema).toHaveProperty('fields', []);
      expect(schema).toHaveProperty('layout', { kind: 'stack' });
      expect(schema).toHaveProperty('options');
      expect(schema.options).toHaveProperty('submitLabel', 'Submit');
      expect(schema.options).toHaveProperty('resetLabel', 'Reset');
      expect(schema.options).toHaveProperty('mode', 'onSubmit');
      expect(schema.options).toHaveProperty('useZodResolver', false);
    });
  });

  describe('createDefaultField', () => {
    it('should create a text field with correct properties', () => {
      const field = createDefaultField('text');

      expect(field).toHaveProperty('type', 'text');
      expect(field).toHaveProperty('id');
      expect(field).toHaveProperty('name');
      expect(field).toHaveProperty('required', false);
      expect(field).toHaveProperty('textKind', 'default');
    });

    it('should create a textarea field with correct properties', () => {
      const field = createDefaultField('textarea');

      expect(field).toHaveProperty('type', 'textarea');
      expect(field).toHaveProperty('rows', 3);
    });

    it('should create a number field with correct properties', () => {
      const field = createDefaultField('number');

      expect(field).toHaveProperty('type', 'number');
      expect(field).toHaveProperty('step', 1);
    });

    it('should create a checkbox field with correct properties', () => {
      const field = createDefaultField('checkbox');

      expect(field).toHaveProperty('type', 'checkbox');
    });

    it('should create a switch field with correct properties', () => {
      const field = createDefaultField('switch');

      expect(field).toHaveProperty('type', 'switch');
    });

    it('should create a select field with correct properties', () => {
      const field = createDefaultField('select');

      expect(field).toHaveProperty('type', 'select');
      expect(field).toHaveProperty('options', []);
    });

    it('should create a radio field with correct properties', () => {
      const field = createDefaultField('radio');

      expect(field).toHaveProperty('type', 'radio');
      expect(field).toHaveProperty('options', []);
    });

    it('should create a date field with correct properties', () => {
      const field = createDefaultField('date');

      expect(field).toHaveProperty('type', 'date');
      expect(field).toHaveProperty('mode', 'date');
    });

    it('should create a slider field with correct properties', () => {
      const field = createDefaultField('slider');

      expect(field).toHaveProperty('type', 'slider');
      expect(field).toHaveProperty('min', 0);
      expect(field).toHaveProperty('max', 100);
      expect(field).toHaveProperty('step', 1);
    });

    it('should create a custom field with correct properties', () => {
      const field = createDefaultField('custom');

      expect(field).toHaveProperty('type', 'custom');
      expect(field).toHaveProperty('componentKey', '');
    });

    it('should apply overrides correctly', () => {
      const field = createDefaultField('text', {
        name: 'customName',
        label: 'Custom Label',
        required: true,
      });

      expect(field).toHaveProperty('name', 'customName');
      expect(field).toHaveProperty('label', 'Custom Label');
      expect(field).toHaveProperty('required', true);
    });

    it('should throw error for unknown field type', () => {
      expect(() => {
        createDefaultField('unknown' as FieldType);
      }).toThrow('Unknown field type: unknown');
    });
  });
});

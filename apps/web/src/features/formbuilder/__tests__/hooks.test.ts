import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createDefaultSchema } from '../form-schema';
import { useFormBuilder } from '../hooks/useFormBuilder';

describe('useFormBuilder', () => {
  it('should initialize with default schema', () => {
    const { result } = renderHook(() => useFormBuilder());

    expect(result.current.schema).toHaveProperty('schemaVersion', '1.0.0');
    expect(result.current.schema).toHaveProperty('title', 'Untitled Form');
    expect(result.current.schema).toHaveProperty('fields', []);
    expect(result.current.selectedFieldId).toBeUndefined();
    expect(result.current.dirty).toBe(false);
  });

  it('should initialize with provided schema', () => {
    const initialSchema = createDefaultSchema();
    initialSchema.title = 'Test Form';

    const { result } = renderHook(() => useFormBuilder(initialSchema));

    expect(result.current.schema.title).toBe('Test Form');
  });

  it('should add field correctly', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      result.current.addField('text');
    });

    expect(result.current.schema.fields).toHaveLength(1);
    expect(result.current.schema.fields[0]).toHaveProperty('type', 'text');
    expect(result.current.dirty).toBe(true);
  });

  it('should add field at specific index', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      result.current.addField('text');
      result.current.addField('textarea');
      result.current.addField('number', 1);
    });

    expect(result.current.schema.fields).toHaveLength(3);
    expect(result.current.schema.fields[0]).toHaveProperty('type', 'text');
    expect(result.current.schema.fields[1]).toHaveProperty('type', 'number');
    expect(result.current.schema.fields[2]).toHaveProperty('type', 'textarea');
  });

  it('should remove field correctly', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      result.current.addField('text');
      result.current.addField('textarea');
    });

    const fieldId = result.current.schema.fields[0].id;

    act(() => {
      result.current.removeField(fieldId);
    });

    expect(result.current.schema.fields).toHaveLength(1);
    expect(result.current.schema.fields[0]).toHaveProperty('type', 'textarea');
    expect(result.current.dirty).toBe(true);
  });

  it('should clear selection when removing selected field', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      result.current.addField('text');
    });

    const fieldId = result.current.schema.fields[0].id;

    act(() => {
      result.current.selectField(fieldId);
    });

    expect(result.current.selectedFieldId).toBe(fieldId);

    act(() => {
      result.current.removeField(fieldId);
    });

    expect(result.current.selectedFieldId).toBeUndefined();
  });

  it('should update field correctly', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      result.current.addField('text');
    });

    const fieldId = result.current.schema.fields[0].id;

    act(() => {
      result.current.updateField(fieldId, { label: 'Updated Label', required: true });
    });

    const updatedField = result.current.schema.fields[0];
    expect(updatedField.label).toBe('Updated Label');
    expect(updatedField.required).toBe(true);
    expect(result.current.dirty).toBe(true);
  });

  it('should reorder fields correctly', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      result.current.addField('text');
      result.current.addField('textarea');
      result.current.addField('number');
    });

    const fieldId = result.current.schema.fields[0].id;

    act(() => {
      result.current.reorderField(fieldId, 2);
    });

    expect(result.current.schema.fields[0]).toHaveProperty('type', 'textarea');
    expect(result.current.schema.fields[1]).toHaveProperty('type', 'number');
    expect(result.current.schema.fields[2]).toHaveProperty('type', 'text');
    expect(result.current.dirty).toBe(true);
  });

  it('should update layout correctly', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      result.current.updateLayout({ kind: 'grid', cols: 2, gap: 4 });
    });

    expect(result.current.schema.layout).toEqual({ kind: 'grid', cols: 2, gap: 4 });
    expect(result.current.dirty).toBe(true);
  });

  it('should select field correctly', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      result.current.addField('text');
    });

    const fieldId = result.current.schema.fields[0].id;

    act(() => {
      result.current.selectField(fieldId);
    });

    expect(result.current.selectedFieldId).toBe(fieldId);
    expect(result.current.selectedField).toEqual(result.current.schema.fields[0]);
  });

  it('should clear selection', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      result.current.addField('text');
      result.current.selectField(result.current.schema.fields[0].id);
    });

    expect(result.current.selectedFieldId).toBeDefined();

    act(() => {
      result.current.selectField();
    });

    expect(result.current.selectedFieldId).toBeUndefined();
    expect(result.current.selectedField).toBeUndefined();
  });

  it('should reset schema correctly', () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      result.current.addField('text');
      result.current.addField('textarea');
      result.current.selectField(result.current.schema.fields[0].id);
    });

    expect(result.current.schema.fields).toHaveLength(2);
    expect(result.current.selectedFieldId).toBeDefined();
    expect(result.current.dirty).toBe(true);

    act(() => {
      result.current.resetSchema();
    });

    expect(result.current.schema.fields).toHaveLength(0);
    expect(result.current.selectedFieldId).toBeUndefined();
    expect(result.current.dirty).toBe(false);
  });

  it('should reset to provided schema', () => {
    const { result } = renderHook(() => useFormBuilder());
    const newSchema = createDefaultSchema();
    newSchema.title = 'New Form';

    act(() => {
      result.current.addField('text');
    });

    expect(result.current.schema.fields).toHaveLength(1);

    act(() => {
      result.current.resetSchema(newSchema);
    });

    expect(result.current.schema.title).toBe('New Form');
    expect(result.current.schema.fields).toHaveLength(0);
    expect(result.current.dirty).toBe(false);
  });

  it('should compute field count correctly', () => {
    const { result } = renderHook(() => useFormBuilder());

    expect(result.current.fieldCount).toBe(0);
    expect(result.current.hasFields).toBe(false);

    act(() => {
      result.current.addField('text');
    });

    expect(result.current.fieldCount).toBe(1);
    expect(result.current.hasFields).toBe(true);

    act(() => {
      result.current.addField('textarea');
    });

    expect(result.current.fieldCount).toBe(2);
    expect(result.current.hasFields).toBe(true);
  });

  it('should debounce schema changes', async () => {
    const { result } = renderHook(() => useFormBuilder());

    act(() => {
      result.current.addField('text');
    });

    // The debounced schema should be the same initially
    expect(result.current.schema).toEqual(result.current.debouncedSchema);

    act(() => {
      result.current.addField('textarea');
    });

    // The debounced schema should still be the old one
    expect(result.current.debouncedSchema.fields).toHaveLength(1);
    expect(result.current.schema.fields).toHaveLength(2);
  });
});

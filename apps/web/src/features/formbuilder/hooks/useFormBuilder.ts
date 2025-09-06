import { useCallback, useMemo, useState } from 'react';
import { FieldSchema, FieldType, FormSchema, createDefaultField, createDefaultSchema } from '../form-schema';
import { useDebounce } from './useDebounce';

/**
 * Custom hook for managing form builder state with performance optimizations
 */
export function useFormBuilder(initialSchema?: FormSchema) {
  const [schema, setSchema] = useState<FormSchema>(() => initialSchema || createDefaultSchema());
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();
  const [dirty, setDirty] = useState(false);

  // Debounce schema changes to prevent excessive re-renders
  const debouncedSchema = useDebounce(schema, 300);

  // Memoized field operations
  const addField = useCallback((fieldType: FieldType, index?: number) => {
    const newField = createDefaultField(fieldType);
    setSchema(prev => {
      const newFields = [...prev.fields];
      if (index !== undefined) {
        newFields.splice(index, 0, newField);
      } else {
        newFields.push(newField);
      }
      return { ...prev, fields: newFields };
    });
    setDirty(true);
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(undefined);
    }
    setDirty(true);
  }, [selectedFieldId]);

  const updateField = useCallback((fieldId: string, updates: Partial<FieldSchema>) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
    }));
    setDirty(true);
  }, []);

  const reorderField = useCallback((fieldId: string, toIndex: number) => {
    setSchema(prev => {
      const fieldToMove = prev.fields.find(f => f.id === fieldId);
      if (!fieldToMove) return prev;

      const otherFields = prev.fields.filter(f => f.id !== fieldId);
      otherFields.splice(toIndex, 0, fieldToMove);
      return { ...prev, fields: otherFields };
    });
    setDirty(true);
  }, []);

  const updateLayout = useCallback((updates: Partial<FormSchema['layout']>) => {
    setSchema(prev => ({
      ...prev,
      layout: { ...prev.layout, ...updates } as any
    }));
    setDirty(true);
  }, []);

  const selectField = useCallback((fieldId?: string) => {
    setSelectedFieldId(fieldId);
  }, []);

  const resetSchema = useCallback((newSchema?: FormSchema) => {
    setSchema(newSchema || createDefaultSchema());
    setSelectedFieldId(undefined);
    setDirty(false);
  }, []);

  // Memoized computed values
  const selectedField = useMemo(() =>
    schema.fields.find(f => f.id === selectedFieldId),
    [schema.fields, selectedFieldId]
  );

  const fieldCount = useMemo(() => schema.fields.length, [schema.fields.length]);

  const hasFields = useMemo(() => schema.fields.length > 0, [schema.fields.length]);

  return {
    // State
    schema,
    debouncedSchema,
    selectedFieldId,
    selectedField,
    dirty,

    // Computed values
    fieldCount,
    hasFields,

    // Actions
    addField,
    removeField,
    updateField,
    reorderField,
    updateLayout,
    selectField,
    resetSchema,
    setDirty,
  };
}

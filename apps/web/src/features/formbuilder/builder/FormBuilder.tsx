import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Label } from '@/components/ui/Label/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select/Select';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
// import { Switch } from '@/components/ui/Switch/Switch';
import { Textarea } from '@/components/ui/Textarea/Textarea';
// import { Card } from '@/components/ui/Card/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/Tabs';

import {
  FormSchema,
  FieldSchema,
  FieldType,
  BuilderState,
  BuilderEvents,
  createDefaultField,
  createDefaultSchema
} from '../form-schema';
import { fieldTypeInfo } from '../registry/defaultRegistry';
import { FormRenderer } from '../renderer/FormRenderer';
import { generateFormTsx } from '../codegen/generateFormTsx';

/**
 * Props for the FormBuilder component
 */
export interface FormBuilderProps {
  /** Initial schema to edit */
  initialSchema?: FormSchema;
  /** Callback when schema changes */
  onSchemaChange?: (schema: FormSchema) => void;
  /** Whether to show debug information */
  debug?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Field palette component for adding new fields
 */
const FieldPalette: React.FC<{
  onAddField: (fieldType: FieldType) => void;
}> = ({ onAddField }) => {
  const fieldCategories = useMemo(() => {
    const categories: Record<string, FieldType[]> = {
      input: ['text', 'textarea', 'number', 'slider'],
      selection: ['checkbox', 'switch', 'select', 'combobox', 'radio'],
      date: ['date'],
      custom: ['custom'],
    };

    return Object.entries(categories).map(([category, types]) => ({
      category,
      fields: types.map(type => ({ type, ...fieldTypeInfo[type] })),
    }));
  }, []);

  return (
    <div className="w-64 bg-muted p-4 rounded-lg">
      <h3 className="font-semibold mb-4">Field Palette</h3>
      <div className="space-y-4">
        {fieldCategories.map(({ category, fields }) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
              {category}
            </h4>
            <div className="space-y-2">
              {fields.map(({ type, label, description, icon }) => (
                <button
                  key={type}
                  onClick={() => onAddField(type)}
                  className="w-full p-3 text-left border border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Field list component for managing existing fields
 */
const FieldList: React.FC<{
  fields: FieldSchema[];
  selectedFieldId?: string;
  onSelectField: (fieldId: string) => void;
  onRemoveField: (fieldId: string) => void;
  onReorderField?: (fieldId: string, toIndex: number) => void;
}> = ({ fields, selectedFieldId, onSelectField, onRemoveField, onReorderField }) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Form Fields</h3>
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No fields added yet. Use the palette to add fields.</p>
      ) : (
        <div className="space-y-2">
          {fields.map((field) => (
            <div
              key={field.id}
              className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedFieldId === field.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
                }`}
              onClick={() => onSelectField(field.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{fieldTypeInfo[field.type].icon}</span>
                  <div>
                    <div className="font-medium text-sm">
                      {field.label || field.name || 'Untitled Field'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {fieldTypeInfo[field.type].label}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveField(field.id);
                    }}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    ×
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Field inspector component for editing field properties
 */
const FieldInspector: React.FC<{
  field: FieldSchema | null;
  onUpdateField: (fieldId: string, updates: Partial<FieldSchema>) => void;
}> = ({ field, onUpdateField }) => {
  if (!field) {
    return (
      <div className="w-80 bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-4">Field Inspector</h3>
        <p className="text-sm text-muted-foreground">Select a field to edit its properties.</p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<FieldSchema>) => {
    onUpdateField(field.id, updates);
  };

  return (
    <div className="w-80 bg-muted p-4 rounded-lg">
      <h3 className="font-semibold mb-4">Field Inspector</h3>
      <div className="space-y-4">
        {/* Basic Properties */}
        <div className="space-y-2">
          <Label htmlFor="field-name">Name</Label>
          <Input
            id="field-name"
            value={field.name}
            onChange={(e) => handleUpdate({ name: e.target.value })}
            placeholder="field_name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={field.label || ''}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            placeholder="Field Label"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input
            id="field-placeholder"
            value={field.placeholder || ''}
            onChange={(e) => handleUpdate({ placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-help">Help Text</Label>
          <Textarea
            id="field-help"
            value={field.helpText || ''}
            onChange={(e) => handleUpdate({ helpText: e.target.value })}
            placeholder="Help text for this field"
            rows={2}
          />
        </div>

        {/* Required Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="field-required"
            checked={field.required || false}
            onCheckedChange={(checked) => handleUpdate({ required: !!checked })}
          />
          <Label htmlFor="field-required">Required</Label>
        </div>

        {/* Type-specific properties */}
        {field.type === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="field-text-kind">Input Type</Label>
            <Select
              value={(field as any).textKind || 'default'}
              onValueChange={(value: any) => handleUpdate({ textKind: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Text</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="password">Password</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="search">Search</SelectItem>
                <SelectItem value="tel">Telephone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {field.type === 'textarea' && (
          <div className="space-y-2">
            <Label htmlFor="field-rows">Rows</Label>
            <Input
              id="field-rows"
              type="number"
              value={(field as any).rows || 3}
              onChange={(e) => handleUpdate({ rows: parseInt(e.target.value) || 3 })}
              min="1"
              max="20"
            />
          </div>
        )}

        {field.type === 'number' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="field-min">Min</Label>
                <Input
                  id="field-min"
                  type="number"
                  value={(field as any).min || ''}
                  onChange={(e) => handleUpdate({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Min"
                />
              </div>
              <div>
                <Label htmlFor="field-max">Max</Label>
                <Input
                  id="field-max"
                  type="number"
                  value={(field as any).max || ''}
                  onChange={(e) => handleUpdate({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Max"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="field-step">Step</Label>
              <Input
                id="field-step"
                type="number"
                value={(field as any).step || 1}
                onChange={(e) => handleUpdate({ step: parseFloat(e.target.value) || 1 })}
                placeholder="Step"
              />
            </div>
          </div>
        )}

        {/* Options for select/combobox/radio */}
        {(field.type === 'select' || field.type === 'combobox' || field.type === 'radio') && (
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {(field as any).options?.map((option: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option.value}
                    onChange={(e) => {
                      const newOptions = [...(field as any).options];
                      newOptions[index] = { ...option, value: e.target.value };
                      handleUpdate({ options: newOptions });
                    }}
                    placeholder="Value"
                    className="flex-1"
                  />
                  <Input
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...(field as any).options];
                      newOptions[index] = { ...option, label: e.target.value };
                      handleUpdate({ options: newOptions });
                    }}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOptions = (field as any).options.filter((_: any, i: number) => i !== index);
                      handleUpdate({ options: newOptions });
                    }}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(field as any).options, { value: '', label: '' }];
                  handleUpdate({ options: newOptions });
                }}
                className="w-full"
              >
                Add Option
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main FormBuilder component
 */
export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialSchema,
  onSchemaChange,
  debug = false,
  className,
}) => {
  const [state, setState] = useState<BuilderState>(() => ({
    schema: initialSchema || createDefaultSchema(),
    selection: undefined,
    dirty: false,
  }));

  // Handle builder events
  const handleBuilderEvent = useCallback((event: BuilderEvents) => {
    setState(prevState => {
      let newState = { ...prevState, dirty: true };

      switch (event.type) {
        case 'addField':
          const newField = createDefaultField(event.field.type, event.field as any);
          const newFields = [...prevState.schema.fields];
          if (event.index !== undefined) {
            newFields.splice(event.index, 0, newField);
          } else {
            newFields.push(newField);
          }
          newState.schema = { ...prevState.schema, fields: newFields };
          break;

        case 'removeField':
          newState.schema = {
            ...prevState.schema,
            fields: prevState.schema.fields.filter(f => f.id !== event.id),
          };
          if (prevState.selection === event.id) {
            newState.selection = undefined;
          }
          break;

        case 'reorderField':
          const fieldToMove = prevState.schema.fields.find(f => f.id === event.id);
          if (fieldToMove) {
            const otherFields = prevState.schema.fields.filter(f => f.id !== event.id);
            otherFields.splice(event.toIndex, 0, fieldToMove);
            newState.schema = { ...prevState.schema, fields: otherFields };
          }
          break;

        case 'updateField':
          newState.schema = {
            ...prevState.schema,
            fields: prevState.schema.fields.map(f =>
              f.id === event.id ? { ...f, ...event.patch } : f
            ),
          };
          break;

        case 'updateLayout':
          newState.schema = {
            ...prevState.schema,
            layout: { ...prevState.schema.layout, ...event.patch } as any,
          };
          break;

        case 'select':
          newState.selection = event.id;
          break;

        case 'reset':
          newState = {
            schema: event.to || createDefaultSchema(),
            selection: undefined,
            dirty: false,
          };
          break;
      }

      return newState;
    });
  }, []);

  // Notify parent of schema changes
  React.useEffect(() => {
    onSchemaChange?.(state.schema);
  }, [state.schema, onSchemaChange]);

  // Generate TSX code
  const tsxCode = useMemo(() => {
    return generateFormTsx(state.schema);
  }, [state.schema]);

  // Generate JSON export
  const jsonExport = useMemo(() => {
    return JSON.stringify(state.schema, null, 2);
  }, [state.schema]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const selectedField = state.schema.fields.find(f => f.id === state.selection);

  return (
    <div className={`flex h-screen ${className}`}>
      {/* Left Panel - Field Palette */}
      <div className="w-64 border-r bg-muted/50 p-4">
        <FieldPalette onAddField={(type) => handleBuilderEvent({ type: 'addField', field: { type } as any })} />
      </div>

      {/* Center Panel - Field List */}
      <div className="flex-1 border-r p-4">
        <FieldList
          fields={state.schema.fields}
          selectedFieldId={state.selection}
          onSelectField={(id) => handleBuilderEvent({ type: 'select', id })}
          onRemoveField={(id) => handleBuilderEvent({ type: 'removeField', id })}
          onReorderField={(id, toIndex) => handleBuilderEvent({ type: 'reorderField', id, toIndex })}
        />
      </div>

      {/* Right Panel - Field Inspector */}
      <div className="w-80 p-4">
        <FieldInspector
          field={selectedField || null}
          onUpdateField={(fieldId, updates) => handleBuilderEvent({ type: 'updateField', id: fieldId, patch: updates })}
        />
      </div>

      {/* Bottom Panel - Preview and Export */}
      <div className="absolute bottom-0 left-0 right-0 h-96 border-t bg-background">
        <Tabs defaultValue="preview" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="tsx">TSX</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="h-full p-4">
            <div className="h-full overflow-auto">
              <FormRenderer schema={state.schema} debug={debug} />
            </div>
          </TabsContent>

          <TabsContent value="json" className="h-full p-4">
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">JSON Export</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(jsonExport)}
                >
                  Copy JSON
                </Button>
              </div>
              <pre className="flex-1 bg-muted p-4 rounded-md overflow-auto text-sm">
                {jsonExport}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="tsx" className="h-full p-4">
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">TSX Export</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(tsxCode)}
                >
                  Copy TSX
                </Button>
              </div>
              <pre className="flex-1 bg-muted p-4 rounded-md overflow-auto text-sm">
                {tsxCode}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FormBuilder;

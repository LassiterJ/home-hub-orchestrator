import { cn } from '@/utils/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormLayout, FormSchema, RenderOptions } from '../form-schema';
import { defaultRegistry } from '../registry/defaultRegistry';

/**
 * Props for the FormRenderer component
 */
export interface FormRendererProps {
  /** The form schema to render */
  schema: FormSchema;
  /** Optional render options including custom registry */
  options?: RenderOptions;
  /** Callback when form is submitted */
  onSubmit?: (data: Record<string, unknown>) => void;
  /** Callback when form is reset */
  onReset?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show debug information */
  debug?: boolean;
}

/**
 * Utility function to generate Tailwind grid classes based on UI props
 */
const gridClassFor = (ui?: { width?: string; className?: string }): string => {
  if (!ui?.width || ui.width === 'full') return 'col-span-full';
  if (ui.width === '1/2') return 'col-span-6';
  if (ui.width === '1/3') return 'col-span-4';
  if (ui.width === '1/4') return 'col-span-3';
  return 'col-span-auto';
};

/**
 * Generate default values from form schema
 */
const generateDefaultValues = (schema: FormSchema): Record<string, unknown> => {
  const defaultValues: Record<string, unknown> = { ...schema.defaultValues };

  // Generate defaults for fields that don't have them
  schema.fields.forEach(field => {
    if (defaultValues[field.name] === undefined) {
      switch (field.type) {
        case 'text':
        case 'textarea':
          defaultValues[field.name] = field.defaultValue || '';
          break;
        case 'number':
          defaultValues[field.name] = field.defaultValue || 0;
          break;
        case 'checkbox':
        case 'switch':
          defaultValues[field.name] = field.defaultValue || false;
          break;
        case 'select':
        case 'combobox':
        case 'radio':
          defaultValues[field.name] = field.defaultValue || '';
          break;
        case 'date':
          defaultValues[field.name] = field.defaultValue || null;
          break;
        case 'slider': {
          const sliderField = field as { type: 'slider'; min: number; max: number; step?: number; name: string; defaultValue?: unknown };
          defaultValues[field.name] = field.defaultValue || sliderField.min || 0;
          break;
        }
        case 'custom':
          defaultValues[field.name] = field.defaultValue || null;
          break;
      }
    }
  });

  return defaultValues;
};

/**
 * Generate Zod schema from form validation rules
 */
const generateZodSchema = (schema: FormSchema): z.ZodSchema | null => {
  if (!schema.options?.useZodResolver) return null;

  const shape: Record<string, z.ZodTypeAny> = {};

  schema.fields.forEach(field => {
    if (!field.validation?.zod) return;

    try {
      // Parse the zod string and add to shape
      // This is a simplified implementation - in production you'd want more robust parsing
      const zodString = field.validation.zod;
      if (zodString.includes('z.string()')) {
        let zodType: z.ZodTypeAny = z.string();

        if (field.validation.minLength) {
          zodType = (zodType as any).min(field.validation.minLength);
        }
        if (field.validation.maxLength) {
          zodType = (zodType as any).max(field.validation.maxLength);
        }
        if (field.validation.email) {
          zodType = (zodType as any).email();
        }
        if (field.validation.url) {
          zodType = (zodType as any).url();
        }
        if (field.validation.pattern) {
          zodType = (zodType as any).regex(new RegExp(field.validation.pattern));
        }

        shape[field.name] = field.required ? zodType : zodType.optional();
      } else if (zodString.includes('z.number()')) {
        let zodType: z.ZodTypeAny = z.number();

        if (field.validation.min !== undefined) {
          zodType = (zodType as any).min(field.validation.min);
        }
        if (field.validation.max !== undefined) {
          zodType = (zodType as any).max(field.validation.max);
        }

        shape[field.name] = field.required ? zodType : zodType.optional();
      } else if (zodString.includes('z.boolean()')) {
        const zodType = z.boolean();
        shape[field.name] = field.required ? zodType : zodType.optional();
      }
    } catch (error) {
      console.warn(`Failed to parse zod validation for field ${field.name}:`, error);
    }
  });

  return Object.keys(shape).length > 0 ? z.object(shape) : null;
};

/**
 * Render form layout based on FormLayout configuration
 */
const renderFormLayout = (
  layout: FormLayout | undefined,
  children: React.ReactNode,
  className?: string
): React.ReactNode => {
  if (!layout || layout.kind === 'stack') {
    return (
      <div className={cn('space-y-4', className)}>
        {children}
      </div>
    );
  }

  if (layout.kind === 'grid') {
    const gridCols = {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    }[layout.cols] || 'grid-cols-2';

    const gap = layout.gap ? `gap-${layout.gap}` : 'gap-4';

    return (
      <div className={cn('grid', gridCols, gap, className)}>
        {children}
      </div>
    );
  }

  if (layout.kind === 'sections') {
    return (
      <div className={cn('space-y-6', className)}>
        {layout.sections.map(section => (
          <div key={section.id} className="space-y-4">
            {section.title && (
              <h3 className="text-lg font-semibold">{section.title}</h3>
            )}
            {section.description && (
              <p className="text-sm text-muted-foreground">{section.description}</p>
            )}
            <div className={cn(
              section.layout?.kind === 'grid'
                ? `grid grid-cols-${(section.layout as any).cols} gap-${(section.layout as any).gap || 4}`
                : 'space-y-4'
            )}>
              {children}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

/**
 * Main FormRenderer component
 */
export const FormRenderer: React.FC<FormRendererProps> = ({
  schema,
  options = { registry: defaultRegistry },
  onSubmit,
  onReset,
  className,
  debug = false,
}) => {
  const registry = options.registry || defaultRegistry;

  // Generate default values and validation schema
  const defaultValues = useMemo(() => generateDefaultValues(schema), [schema]);
  const zodSchema = useMemo(() => generateZodSchema(schema), [schema]);

  // Initialize React Hook Form
  const form = useForm({
    defaultValues,
    mode: schema.options?.mode || 'onSubmit',
    resolver: zodSchema ? zodResolver(zodSchema as any) : undefined,
  });

  const { handleSubmit, register, control, formState: { errors }, watch, reset } = form;

  // Handle form submission
  const handleFormSubmit = (data: Record<string, unknown>) => {
    if (debug) {
      console.log('Form submitted with data:', data);
    }
    onSubmit?.(data);
  };

  // Handle form reset
  const handleFormReset = () => {
    reset();
    onReset?.();
  };

  // Render individual field
  const renderField = (field: any) => {
    const registryEntry = registry[field.type as keyof typeof registry];
    if (!registryEntry) {
      console.warn(`No registry entry found for field type: ${field.type}`);
      return (
        <div key={field.id} className="p-4 border border-dashed border-red-500 rounded-md">
          <p className="text-sm text-red-500">
            Unknown field type: {field.type}
          </p>
        </div>
      );
    }

    const rhfUtils = {
      register,
      Controller,
      control,
      errors,
      watch,
    };

    return (
      <div key={field.id}>
        {registryEntry.render({
          field,
          rhf: rhfUtils,
          gridClassFor,
        })}
      </div>
    );
  };

  // Render form fields based on layout
  const renderFields = () => {
    if (schema.layout?.kind === 'sections') {
      return schema.layout.sections.map(section => (
        <div key={section.id} className="space-y-4">
          {section.title && (
            <h3 className="text-lg font-semibold">{section.title}</h3>
          )}
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
          <div className={cn(
            section.layout?.kind === 'grid'
              ? `grid grid-cols-${(section.layout as { kind: 'grid'; cols: 2 | 3 | 4; gap?: number }).cols} gap-${(section.layout as { kind: 'grid'; cols: 2 | 3 | 4; gap?: number }).gap || 4}`
              : 'space-y-4'
          )}>
            {section.fields.map(fieldId => {
              const field = schema.fields.find(f => f.id === fieldId);
              return field ? renderField(field) : null;
            })}
          </div>
        </div>
      ));
    }

    return schema.fields.map(renderField);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className={cn('w-full', className)}
      >
        {/* Form Header */}
        {(schema.title || schema.description) && (
          <div className="mb-6">
            {schema.title && (
              <h2 className="text-2xl font-bold mb-2">{schema.title}</h2>
            )}
            {schema.description && (
              <p className="text-muted-foreground">{schema.description}</p>
            )}
          </div>
        )}

        {/* Form Fields */}
        {renderFormLayout(schema.layout, renderFields())}

        {/* Form Actions */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {schema.options?.submitLabel || 'Submit'}
          </button>
          <button
            type="button"
            onClick={handleFormReset}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            {schema.options?.resetLabel || 'Reset'}
          </button>
        </div>

        {/* Debug Information */}
        {debug && (
          <div className="mt-8 p-4 bg-muted rounded-md">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({ schema, defaultValues, errors }, null, 2)}
            </pre>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default FormRenderer;

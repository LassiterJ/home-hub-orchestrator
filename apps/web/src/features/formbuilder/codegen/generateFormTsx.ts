import { CodegenOptions, ExportBundle, FormSchema } from '../form-schema';
import { defaultRegistry } from '../registry/defaultRegistry';

/**
 * Generate TSX code from a FormSchema
 */
export const generateFormTsx = (
  schema: FormSchema,
  options: CodegenOptions = { registry: defaultRegistry }
): string => {
  const registry = options.registry || defaultRegistry;

  // Collect all unique imports needed
  const imports = new Set<string>();
  const componentImports = new Set<string>();

  // Add base React Hook Form imports
  imports.add("import React from 'react'");
  imports.add("import { useForm } from 'react-hook-form'");

  // Add Zod imports if needed
  if (schema.options?.useZodResolver) {
    imports.add("import { zodResolver } from '@hookform/resolvers/zod'");
    imports.add("import { z } from 'zod'");
  }

  // Add form component imports
  componentImports.add("import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/Form'");

  // Collect imports from field registry
  schema.fields.forEach(field => {
    const registryEntry = registry[field.type];
    if (registryEntry) {
      registryEntry.imports.forEach(imp => {
        if (imp.includes('@/components/ui/')) {
          componentImports.add(imp);
        } else {
          imports.add(imp);
        }
      });
    }
  });

  // Generate component name from schema
  const componentName = schema.title
    ? schema.title.replace(/[^a-zA-Z0-9]/g, '') + 'Form'
    : 'GeneratedForm';

  // Generate Zod schema if needed
  const zodSchemaCode = generateZodSchema(schema);

  // Generate form fields
  const fieldsCode = schema.fields.map(field => {
    const registryEntry = registry[field.type];
    if (!registryEntry) {
      return `      {/* Unknown field type: ${field.type} */}`;
    }

    return registryEntry.toTsx({
      field,
      vars: {
        dataName: 'form',
        controlName: 'Controller',
        errorsName: 'errors',
      },
    });
  }).join('\n\n');

  // Generate layout wrapper
  const layoutWrapper = generateLayoutWrapper(schema.layout);

  // Generate default values
  const defaultValuesCode = generateDefaultValues(schema);

  // Generate validation rules
  const validationRulesCode = generateValidationRules(schema);

  // Generate the complete TSX
  const tsxCode = `${options.banner || `// Generated form component from FormBuilder
// Schema ID: ${schema.id}
// Generated at: ${new Date().toISOString()}`}

${Array.from(imports).join('\n')}
${Array.from(componentImports).join('\n')}

${zodSchemaCode}

export function ${componentName}() {
  const form = useForm({
    defaultValues: ${defaultValuesCode},
    mode: '${schema.options?.mode || 'onSubmit'}',
    ${schema.options?.useZodResolver && zodSchemaCode ? 'resolver: zodResolver(schema),' : ''}
  });

  const { handleSubmit, register, control, formState: { errors } } = form;

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
    // Add your submit logic here
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        ${schema.title ? `<h2 className="text-2xl font-bold mb-4">${schema.title}</h2>` : ''}
        ${schema.description ? `<p className="text-muted-foreground mb-6">${schema.description}</p>` : ''}
        
        ${layoutWrapper.replace('{children}', fieldsCode)}
        
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            ${schema.options?.submitLabel || 'Submit'}
          </button>
          <button
            type="button"
            onClick={() => form.reset()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            ${schema.options?.resetLabel || 'Reset'}
          </button>
        </div>
      </form>
    </Form>
  );
}

export default ${componentName};
`;

  return tsxCode;
};

/**
 * Generate Zod schema from form validation rules
 */
function generateZodSchema(schema: FormSchema): string {
  if (!schema.options?.useZodResolver) return '';

  const shapeEntries: string[] = [];

  schema.fields.forEach(field => {
    if (!field.validation?.zod) return;

    try {
      // Parse the zod string and add to shape
      const zodString = field.validation.zod;
      if (zodString.includes('z.string()')) {
        let zodType = 'z.string()';

        if (field.validation.minLength) {
          zodType += `.min(${field.validation.minLength})`;
        }
        if (field.validation.maxLength) {
          zodType += `.max(${field.validation.maxLength})`;
        }
        if (field.validation.email) {
          zodType += '.email()';
        }
        if (field.validation.url) {
          zodType += '.url()';
        }
        if (field.validation.pattern) {
          zodType += `.regex(/${field.validation.pattern}/)`;
        }

        shapeEntries.push(`  ${field.name}: ${field.required ? zodType : `${zodType}.optional()`}`);
      } else if (zodString.includes('z.number()')) {
        let zodType = 'z.number()';

        if (field.validation.min !== undefined) {
          zodType += `.min(${field.validation.min})`;
        }
        if (field.validation.max !== undefined) {
          zodType += `.max(${field.validation.max})`;
        }

        shapeEntries.push(`  ${field.name}: ${field.required ? zodType : `${zodType}.optional()`}`);
      } else if (zodString.includes('z.boolean()')) {
        const zodType = 'z.boolean()';
        shapeEntries.push(`  ${field.name}: ${field.required ? zodType : `${zodType}.optional()`}`);
      }
    } catch (error) {
      console.warn(`Failed to parse zod validation for field ${field.name}:`, error);
    }
  });

  if (shapeEntries.length === 0) return '';

  return `const schema = z.object({
${shapeEntries.join(',\n')}
});

type FormData = z.infer<typeof schema>;
`;
}

/**
 * Generate layout wrapper based on FormLayout
 */
function generateLayoutWrapper(layout: FormSchema['layout']): string {
  if (!layout || layout.kind === 'stack') {
    return '<div className="space-y-4">\n{children}\n</div>';
  }

  if (layout.kind === 'grid') {
    const gridLayout = layout as { kind: 'grid'; cols: 2 | 3 | 4; gap?: number };
    const gridCols = {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    }[gridLayout.cols] || 'grid-cols-2';

    const gap = gridLayout.gap ? `gap-${gridLayout.gap}` : 'gap-4';

    return `<div className="grid ${gridCols} ${gap}">\n{children}\n</div>`;
  }

  if (layout.kind === 'sections') {
    const sectionsLayout = layout as { kind: 'sections'; sections: any[] };
    const sections = sectionsLayout.sections.map(section => {
      const sectionLayout = section.layout?.kind === 'grid'
        ? `grid grid-cols-${(section.layout as { kind: 'grid'; cols: 2 | 3 | 4; gap?: number }).cols} gap-${(section.layout as { kind: 'grid'; cols: 2 | 3 | 4; gap?: number }).gap || 4}`
        : 'space-y-4';

      return `        <div className="space-y-4">
          ${section.title ? `<h3 className="text-lg font-semibold">${section.title}</h3>` : ''}
          ${section.description ? `<p className="text-sm text-muted-foreground">${section.description}</p>` : ''}
          <div className="${sectionLayout}">
            {/* Section fields will be inserted here */}
          </div>
        </div>`;
    }).join('\n');

    return `<div className="space-y-6">\n${sections}\n</div>`;
  }

  return '<div>\n{children}\n</div>';
}

/**
 * Generate default values object
 */
function generateDefaultValues(schema: FormSchema): string {
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

  return JSON.stringify(defaultValues, null, 2);
}

/**
 * Generate validation rules object
 */
function generateValidationRules(schema: FormSchema): string {
  const rules: Record<string, any> = {};

  schema.fields.forEach(field => {
    if (!field.validation) return;

    const fieldRules: any = {};

    if (field.required) fieldRules.required = true;
    if (field.validation.minLength) fieldRules.minLength = field.validation.minLength;
    if (field.validation.maxLength) fieldRules.maxLength = field.validation.maxLength;
    if (field.validation.min !== undefined) fieldRules.min = field.validation.min;
    if (field.validation.max !== undefined) fieldRules.max = field.validation.max;
    if (field.validation.pattern) fieldRules.pattern = new RegExp(field.validation.pattern);
    if (field.validation.email) fieldRules.type = 'email';
    if (field.validation.url) fieldRules.type = 'url';

    if (Object.keys(fieldRules).length > 0) {
      rules[field.name] = fieldRules;
    }
  });

  return JSON.stringify(rules, null, 2);
}

/**
 * Generate complete export bundle
 */
export const generateExportBundle = (
  schema: FormSchema,
  options: CodegenOptions = { registry: defaultRegistry }
): ExportBundle => {
  const tsx = generateFormTsx(schema, options);

  return {
    json: schema,
    tsx,
    files: [
      {
        path: `${schema.title?.replace(/[^a-zA-Z0-9]/g, '') || 'GeneratedForm'}.tsx`,
        contents: tsx,
      },
    ],
  };
};

/**
 * Format TSX code using Prettier (if available)
 */
export const formatTsx = async (tsxCode: string): Promise<string> => {
  try {
    // Try to use Prettier if available
    const prettier = await import('prettier');
    return await prettier.format(tsxCode, {
      parser: 'typescript',
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
    });
  } catch (error) {
    // Fallback to basic formatting if Prettier is not available
    console.info('Prettier not available, using basic formatting');
    return tsxCode;
  }
};

import { describe, expect, it } from 'vitest';
import { generateFormTsx } from '../codegen/generateFormTsx';
import { createDefaultField, createDefaultSchema } from '../form-schema';

describe('Code Generation', () => {
  describe('generateFormTsx', () => {
    it('should generate basic form component', () => {
      const schema = createDefaultSchema();
      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('export function');
      expect(tsx).toContain('useForm');
      expect(tsx).toContain('Form');
      expect(tsx).toContain('form.handleSubmit');
      expect(tsx).toContain('Submit');
      expect(tsx).toContain('Reset');
    });

    it('should generate form with text field', () => {
      const schema = createDefaultSchema();
      schema.fields = [createDefaultField('text', { name: 'username', label: 'Username' })];

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('username');
      expect(tsx).toContain('Username');
      expect(tsx).toContain('Input');
      expect(tsx).toContain('FormItem');
      expect(tsx).toContain('FormLabel');
      expect(tsx).toContain('FormControl');
    });

    it('should generate form with textarea field', () => {
      const schema = createDefaultSchema();
      schema.fields = [createDefaultField('textarea', { name: 'description', label: 'Description' })];

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('description');
      expect(tsx).toContain('Description');
      expect(tsx).toContain('Textarea');
      expect(tsx).toContain('rows={3}');
    });

    it('should generate form with number field', () => {
      const schema = createDefaultSchema();
      schema.fields = [createDefaultField('number', { name: 'age', label: 'Age' })];

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('age');
      expect(tsx).toContain('Age');
      expect(tsx).toContain('type="number"');
      expect(tsx).toContain('step={1}');
    });

    it('should generate form with checkbox field', () => {
      const schema = createDefaultSchema();
      schema.fields = [createDefaultField('checkbox', { name: 'agree', label: 'I agree' })];

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('agree');
      expect(tsx).toContain('I agree');
      expect(tsx).toContain('Checkbox');
    });

    it('should generate form with select field', () => {
      const schema = createDefaultSchema();
      const selectField = createDefaultField('select', {
        name: 'country',
        label: 'Country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' }
        ]
      });
      schema.fields = [selectField];

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('country');
      expect(tsx).toContain('Country');
      expect(tsx).toContain('Select');
      expect(tsx).toContain('SelectTrigger');
      expect(tsx).toContain('SelectContent');
      expect(tsx).toContain('SelectItem');
      expect(tsx).toContain('United States');
      expect(tsx).toContain('Canada');
    });

    it('should generate form with radio field', () => {
      const schema = createDefaultSchema();
      const radioField = createDefaultField('radio', {
        name: 'gender',
        label: 'Gender',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' }
        ]
      });
      schema.fields = [radioField];

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('gender');
      expect(tsx).toContain('Gender');
      expect(tsx).toContain('RadioGroup');
      expect(tsx).toContain('RadioGroupItem');
      expect(tsx).toContain('Male');
      expect(tsx).toContain('Female');
    });

    it('should generate form with date field', () => {
      const schema = createDefaultSchema();
      schema.fields = [createDefaultField('date', { name: 'birthdate', label: 'Birth Date' })];

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('birthdate');
      expect(tsx).toContain('Birth Date');
      expect(tsx).toContain('DatePicker');
    });

    it('should generate form with slider field', () => {
      const schema = createDefaultSchema();
      schema.fields = [createDefaultField('slider', { name: 'rating', label: 'Rating' })];

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('rating');
      expect(tsx).toContain('Rating');
      expect(tsx).toContain('type="range"');
      expect(tsx).toContain('min={0}');
      expect(tsx).toContain('max={100}');
    });

    it('should generate form with custom title and description', () => {
      const schema = createDefaultSchema();
      schema.title = 'User Registration';
      schema.description = 'Please fill out the form below';

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('User Registration');
      expect(tsx).toContain('Please fill out the form below');
    });

    it('should generate form with custom submit/reset labels', () => {
      const schema = createDefaultSchema();
      schema.options = {
        ...schema.options,
        submitLabel: 'Register',
        resetLabel: 'Clear'
      };

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('Register');
      expect(tsx).toContain('Clear');
    });

    it('should generate form with grid layout', () => {
      const schema = createDefaultSchema();
      schema.layout = { kind: 'grid', cols: 2, gap: 4 };
      schema.fields = [
        createDefaultField('text', { name: 'firstName', label: 'First Name' }),
        createDefaultField('text', { name: 'lastName', label: 'Last Name' })
      ];

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('grid grid-cols-2 gap-4');
    });

    it('should generate form with sections layout', () => {
      const schema = createDefaultSchema();
      schema.layout = {
        kind: 'sections',
        sections: [
          {
            id: 'personal',
            title: 'Personal Information',
            description: 'Your personal details',
            fields: ['field1']
          }
        ]
      };
      schema.fields = [createDefaultField('text', { id: 'field1', name: 'name', label: 'Name' })];

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('Personal Information');
      expect(tsx).toContain('Your personal details');
    });

    it('should generate form with required field validation', () => {
      const schema = createDefaultSchema();
      schema.fields = [createDefaultField('text', {
        name: 'email',
        label: 'Email',
        required: true
      })];

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('required: true');
    });

    it('should generate form with custom component name', () => {
      const schema = createDefaultSchema();
      schema.title = 'UserForm';

      const tsx = generateFormTsx(schema);

      expect(tsx).toContain('export function UserForm()');
    });
  });
});

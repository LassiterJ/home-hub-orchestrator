import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/form-builder-v2')({
   component: FormBuilderPageV2,
})

/**
 * FormBuilderPageV2
 *
 * ***Form Builder***
 * Description:
 *    Workflow Nodes for building forms using the WorkflowBuilder. Make a form workflow, and export it as its own Workflow Node to be used in other workflows.
 * Components:
 * Layout:
 *    Sidebar (left)
 *    Form Editor Pane (main)
 *    Contextual Pane (bottom)
 *       Field Inspector (Tab)
 *       Preview (Tab)
 * Form Components
 *    Base UI from components/ui:
 *       Inputs:
 *          Input
 *             Text
 *             Number
 *             File
 *             Email
 *             Phone
 *             Password
 *             Select
 *             Checkbox
 *             Radio Group
 *             Combobox
 *             TextArea
 *             DatePicker
 *        Layout:
 *          Row (full width of form. Renders all children inline and wraps if there is not enough space)
 *          Container ( simple container element that adds padding for now, will likely expand role or merge with another in the future )
 *          Separator
 *        Control (either node or edge or both?):
 *          Conditional (either one component or individual components for conditional logic like if/else, and/or, custom condition(some form of callback function maybe?)
 *          Fetch (a node that is used to grab data. For Forms it can be used as a step to gather options for a select. I imagine a workflow like FormNode -> FetchNode{gets select options} -> FormNode -> Submit Node)
 *          Step (symbolizes a step in a wizard-style form)
 *
 * */


# Ordered Dropdown Extension

This extension provides a custom dropdown control for Azure DevOps work item forms. It allows you to order dropdown items according to your business needs, rather than the default alphabetical ordering.

## Features

- Custom ordering of dropdown items
- Easy integration with existing work item fields
- Preserves any items not in the custom order at the end of the list

## How to use

1. Install the extension in your Azure DevOps organization
2. Edit a work item type and add the "Ordered Dropdown" control
3. Configure the control to use a specific field

## Configuration

To set up the custom order, modify the `loadCustomOrder` function in the `ordered-dropdown.js` file. In a real-world scenario, you'd want to load this order from a configuration setting or another work item field.

## Support

If you encounter any issues or have feature requests, please file an issue in the extension's repository.
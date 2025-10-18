// AI prompts placeholder - replace with actual prompts

export const codePrompt = 'Generate code based on the user request.';

export function updateDocumentPrompt(content: string, type: string): string {
  return `Update the ${type} document with the following content: ${content}. Please make the requested changes.`;
}

export const textPrompt = 'Generate text content based on the user request.';

export const imagePrompt = 'Generate image content based on the user request.';

export const sheetPrompt = 'Generate spreadsheet data based on the user request.';

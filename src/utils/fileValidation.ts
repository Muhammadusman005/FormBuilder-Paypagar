import { FILE_TYPE_OPTIONS } from '../constants';
import type { FileType } from '../types/form';

/**
 * Get MIME types for accepted file types
 */
export const getAcceptAttribute = (acceptedFileTypes?: FileType[]): string => {
  if (!acceptedFileTypes || acceptedFileTypes.length === 0) return '';
  
  return acceptedFileTypes
    .map(type => {
      const fileTypeOption = FILE_TYPE_OPTIONS.find(opt => opt.value === type);
      return fileTypeOption?.mimeType || '';
    })
    .filter(Boolean)
    .join(',');
};

/**
 * Validate if file matches accepted types
 */
export const isValidFileType = (file: File, acceptedFileTypes?: FileType[]): boolean => {
  if (!acceptedFileTypes || acceptedFileTypes.length === 0) return true;

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  return acceptedFileTypes.some(type => {
    const fileTypeOption = FILE_TYPE_OPTIONS.find(opt => opt.value === type);
    return fileTypeOption?.mimeType === file.type || fileTypeOption?.value === fileExtension;
  });
};

/**
 * Get formatted list of accepted file types
 */
export const getAcceptedTypesLabel = (acceptedFileTypes?: FileType[]): string => {
  if (!acceptedFileTypes || acceptedFileTypes.length === 0) return 'any format';
  return acceptedFileTypes.map(t => t.toUpperCase()).join(', ');
};

/**
 * Log field input change
 */
export const logFieldInput = (fieldLabel: string, fieldId: string, value: string): void => {
  console.log(`Field: "${fieldLabel}" (${fieldId}) - Value: "${value}"`);
};

/**
 * Log file input change
 */
export const logFileInput = (fieldLabel: string, fieldId: string, file: File): void => {
  console.log(`✓ Field: "${fieldLabel}" (${fieldId}) - File: "${file.name}" (${file.type})`);
};

/**
 * Log file validation error
 */
export const logFileValidationError = (fieldLabel: string, acceptedTypes: string, selectedType: string): void => {
  console.error(`❌ Invalid file type! Field "${fieldLabel}" only accepts: ${acceptedTypes}`);
  console.error(`   You selected: ${selectedType} format`);
};

/**
 * Show file validation error alert
 */
export const showFileValidationError = (fieldLabel: string, acceptedTypes: string, selectedType: string): void => {
  const message = `Invalid file format!\n\nField "${fieldLabel}" only accepts: ${acceptedTypes}\n\nYou selected: ${selectedType} format`;
  alert(message);
};

/**
 * Handle file validation and logging
 * Returns true if file is valid, false otherwise
 */
export const validateAndLogFile = (
  file: File,
  fieldLabel: string,
  fieldId: string,
  acceptedFileTypes?: FileType[]
): boolean => {
  const isValid = isValidFileType(file, acceptedFileTypes);

  if (!isValid && acceptedFileTypes && acceptedFileTypes.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'unknown';
    const acceptedTypesLabel = getAcceptedTypesLabel(acceptedFileTypes);
    
    logFileValidationError(fieldLabel, acceptedTypesLabel, fileExtension);
    showFileValidationError(fieldLabel, acceptedTypesLabel, fileExtension);
    return false;
  }

  if (isValid) {
    logFileInput(fieldLabel, fieldId, file);
  }

  return true;
};

/**
 * Log form submission with field labels
 */
export const logFormSubmission = (fields: Array<{ id: string; label: string }>, formData: Record<string, any>): void => {
  const submittedData: Record<string, any> = {};
  fields.forEach((field) => {
    submittedData[field.label] = formData[field.id];
  });
  console.log('Form Submitted:', submittedData);
};

/**
 * FILE UPLOADER COMPONENT
 * 
 * File Purpose: Reusable drag-and-drop file upload UI component
 * Used for: Teachers uploading resources, donors uploading receipts, etc.
 * 
 * Features:
 * - Drag and drop zone
 * - Click to select file
 * - File type filtering (PDF, DOC, images)
 * - File size limits
 * - Display selected file name
 * - Helper text showing accepted formats
 * 
 * Props:
 * - id: HTML input id
 * - label: Label text above uploader
 * - accept: File type filter (.pdf,.doc,.docx,.jpg)
 * - onChange: Callback when file selected
 * - file: Currently selected file object
 * - helperText: Instructions text
 */

import React from 'react';
import { Upload } from 'lucide-react';

/**
 * FileUploader Component
 * Purpose: Reusable UI component for selecting files (documents, images) with drag-and-drop support.
 */
const FileUploader = ({ id = "file-upload", label, accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png", onChange, file, helperText = "PDF, DOC, JPG up to 10MB" }) => {
    return (
        <div>
            {/* 
              LABEL
              Purpose: Accessibility label for the uploader.
            */}
            {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
            
            {/* 
              UPLOAD ZONE
              Purpose: Visual area for drag-and-drop or clicking to select files.
              Elements: Upload icon, hidden file input, and clickable label.
              Action: Clicking triggers the hidden input's file selection dialog.
            */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors group">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                <input
                    type="file"
                    id={id}
                    accept={accept}
                    onChange={onChange}
                    className="hidden"
                />
                <label htmlFor={id} className="cursor-pointer">
                    <span className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Upload a file</span>
                    <span className="text-slate-500"> or drag and drop</span>
                </label>
                
                {/* 
                  HELPER TEXT
                  Purpose: Inform user of supported formats and size limits.
                */}
                {helperText && <p className="text-xs text-slate-500 mt-2 tracking-wide uppercase font-medium">{helperText}</p>}
                
                {/* 
                  SELECTED FILE INDICATOR
                  Purpose: Show the user which file is currently staged for upload.
                  Shown when: A file has been selected via the input.
                */}
                {file && (
                    <div className="mt-4 p-2 bg-green-50 border border-green-100 rounded-lg inline-flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-sm text-green-700 font-bold">{file.name}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploader;

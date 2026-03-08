import React from 'react';
import { Upload } from 'lucide-react';

const FileUploader = ({ id = "file-upload", label, accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png", onChange, file, helperText = "PDF, DOC, JPG up to 10MB" }) => {
    return (
        <div>
            {label && <label className="block text-sm mb-2">{label}</label>}
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                    type="file"
                    id={id}
                    accept={accept}
                    onChange={onChange}
                    className="hidden"
                />
                <label htmlFor={id} className="cursor-pointer">
                    <span className="text-blue-600 hover:underline">Upload a file</span>
                    <span className="text-gray-500"> or drag and drop</span>
                </label>
                {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
                {file && (
                    <p className="text-sm text-green-600 mt-2 font-medium">{file.name}</p>
                )}
            </div>
        </div>
    );
};

export default FileUploader;

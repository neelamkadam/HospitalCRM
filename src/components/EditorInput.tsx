import React, { useRef, useEffect } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "./EditorInput.css";

interface EditorInputProps {
  label?: string;
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
  error?: boolean;
  errorText?: string;
  readOnly?: boolean;
  isRequired?: boolean;
  fontSize?: string; // New prop for custom font size;
  height?: string;
}

const EditorInput: React.FC<EditorInputProps> = ({
  label,
  onChange,
  value,
  placeholder,
  error,
  errorText,
  readOnly,
  isRequired,
  fontSize = "18px", // Default font size
  height,
}) => {
  const editorRef = useRef<Editor>(null);

  const handleChange = () => {
    const editorInstance = editorRef.current?.getInstance();
    const content = editorInstance?.getMarkdown() || "";
    onChange?.(content);
  };

  useEffect(() => {
    if (editorRef.current) {
      const editorInstance = editorRef.current.getInstance();
      if (value !== undefined && editorInstance.getMarkdown() !== value) {
        editorInstance.setMarkdown(value);
      }
    }
  }, [value]);

  return (
    <div className="w-full text-left pt-0 !mt-0">
      {/* Label */}
      {label && (
        <div className="flex space-x-1">
          <label className="block text-sm font-medium text-[#1A2435] mb-2">
            {label}
          </label>
          {isRequired && <div className="text-gray-500">*</div>}
        </div>
      )}

      {/* Editor Container */}
      <div
        className={`
        relative focus-within:!ring-2 sm:text-base shadow-sm
        ${error && errorText ? "focus-within:!ring-red-500 !bg-red-100" : ""}
      `}
        style={{
          height: height,
          fontSize: fontSize, // Apply custom font size
          overflow: "visible",
        }}
      >
        <style>{`
          .toastui-editor-contents {
            font-size: ${fontSize} !important;
            color: #526279 !important;
          }
          .toastui-editor-contents p,
          .toastui-editor-contents li,
          .toastui-editor-contents span,
          .toastui-editor-contents div {
            font-size: ${fontSize} !important;
            color: #ADB1B7 !important;
          }
          .ProseMirror {
            font-size: ${fontSize} !important;
            color: #526279 !important;
          }
          .toastui-editor-contents h1 {
            font-size: calc(${fontSize} * 2) !important;
            color: #526279 !important;
          }
          .toastui-editor-contents h2 {
            font-size: calc(${fontSize} * 1.5) !important;
            color: #526279 !important;
          }
          .toastui-editor-contents h3 {
            font-size: calc(${fontSize} * 1.25) !important;
            color: #526279 !important;
          }
          .ProseMirror p {
            color: #526279 !important;
          }
          .toastui-editor-contents::-webkit-scrollbar-thumb {
            background: #E5E7EB !important;
          }
          .ProseMirror::-webkit-scrollbar-thumb {
            background: #E5E7EB !important;
          }
          .toastui-editor-md-container::-webkit-scrollbar-thumb {
            background: #E5E7EB !important;
          }
          .toastui-editor-ww-container::-webkit-scrollbar-thumb {
            background: #E5E7EB !important;
          }
          .toastui-editor::-webkit-scrollbar-thumb {
            background: #E5E7EB !important;
          }
          .toastui-editor-popup {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            max-width: 90vw !important;
            z-index: 9999 !important;
          }
          @media (max-width: 768px) {
            .toastui-editor-popup {
              left: auto !important;
              right: 20px !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              max-width: calc(100vw - 40px) !important;
              z-index: 9999 !important;
            }
          }
        
        `}</style>
        <Editor
          ref={editorRef}
          initialValue={value || ""}
          placeholder={error && errorText ? errorText : placeholder}
          onChange={handleChange}
          previewStyle="tab"
          height="100%"
          initialEditType="wysiwyg"
          useCommandShortcut={true}
          readOnly={readOnly}
          usageStatistics={false}
          hideModeSwitch={true}
          autofocus={false}
          toolbarItems={[
            ["heading", "bold", "italic"],
            ["hr"],
            ["ul", "ol"],
            ["link"],
          ]}
          className={`editor-font-30 ${
            error && errorText ? "!bg-red-100" : ""
          }`}
        />
      </div>

      {/* Character Count */}
      {/* <div className="flex justify-end mt-1">
        <span
          className={`text-xs ${
            (value?.length || 0) > 1500
              ? "text-red-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          {value?.length || 0} / 1500
        </span>
      </div> */}
    </div>
  );
};

export default EditorInput;

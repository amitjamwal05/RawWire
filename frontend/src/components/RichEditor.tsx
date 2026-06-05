'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import Quill to avoid SSR window is not defined errors
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  }), []);

  return (
    <div className="w-full h-auto min-h-[200px] mb-4 editor-container">
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
        formats={['bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'link']}
        placeholder={placeholder}
      />
    </div>
  );
}

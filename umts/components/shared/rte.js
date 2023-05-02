import React, { useState, useEffect } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import styles from './rte.module.scss'

const RTE = ({ handlePropsChange, keyValue, value, parent, handleBlur, path, form, placeholder = '' }) => {
  const [editorValue, setEditorValue] = useState(value)
  useEffect(() => {
    handlePropsChange(path, editorValue)
  }, [editorValue, keyValue])

  return (
    <div className={styles.rteContainer}>
      <CKEditor
        config={{
          toolbar: ['heading', 'bold', 'italic', 'link', 'bulletedList', '|', 'undo', 'redo'],
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            ],
          },
          placeholder: placeholder,
        }}
        editor={ClassicEditor}
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData()
          setEditorValue(data)
        }}
        onBlur={(event, editor) =>
          handleBlur !== undefined ? handleBlur(editor, parent ? `${keyValue + parent}` : keyValue, `${path}`) : ''
        }
      />
    </div>
  )
}

export default RTE

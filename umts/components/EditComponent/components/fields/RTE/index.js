import React, { useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import styles from './rte.module.scss'
import { Field } from 'formik'

const RichTextEditor = ({ name, placeholder }) => {
  const [focused, setFocused] = useState(false)

  return (
    <Field name={name}>
      {({ field, form, meta }) => {
        return (
          <div className="p-4 border border-gray-400 rounded-lg">
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
                data={field.value}
                onChange={(event, editor) => {
                  if (focused) form.setFieldValue(name, editor.getData())
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </div>
          </div>
        )
      }}
    </Field>
  )
}

export default React.memo(RichTextEditor)

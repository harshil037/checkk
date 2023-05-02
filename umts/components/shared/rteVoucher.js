import React, { useState, useEffect } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import styles from './rte.module.scss'

const RTE = ({ value, path, formik }) => {
  // const [editorValue, setEditorValue] = useState(value)
  // useEffect(() => {
  //   handlePropsChange(path, editorValue)
  // }, [editorValue, keyValue])

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
        }}
        editor={ClassicEditor}
        data={value}
        onChange={(event, editor) => {
          // Dynamically set property of nested object
          // https://stackoverflow.com/questions/18936915/dynamically-set-property-of-nested-object
          function set(obj, path, value) {
            var schema = obj
            var keysList = path.split('.')
            var len = keysList.length
            for (var i = 0; i < len - 1; i++) {
              var key = keysList[i]
              // checking if key represents an array element e.g. users[0]
              if (key.includes('[')) {
                //getting propertyName 'users' form key 'users[0]'
                var propertyName = key.substr(
                  0,
                  key.length - key.substr(key.indexOf('['), key.length - key.indexOf('[')).length,
                )
                if (!schema[propertyName]) {
                  schema[propertyName] = []
                }
                // schema['users'][getting index 0 from 'users[0]']
                if (
                  !schema[propertyName][
                    parseInt(key.substr(key.indexOf('[') + 1, key.indexOf(']') - key.indexOf('[') - 1))
                  ]
                ) {
                  // if it doesn't exist create and initialise it
                  schema = schema[propertyName][
                    parseInt(key.substr(key.indexOf('[') + 1, key.indexOf(']') - key.indexOf('[') - 1))
                  ] = {}
                } else {
                  schema =
                    schema[propertyName][
                      parseInt(key.substr(key.indexOf('[') + 1, key.indexOf(']') - key.indexOf('[') - 1))
                    ]
                }
                continue
              }
              if (!schema[key]) {
                schema[key] = {}
              }
              schema = schema[key]
            } //loop ends
            // if last key is array element
            if (keysList[len - 1].includes('[')) {
              //getting propertyName 'users' form key 'users[0]'
              var propertyName = keysList[len - 1].substr(
                0,
                keysList[len - 1].length -
                  keysList[len - 1].substr(
                    keysList[len - 1].indexOf('['),
                    keysList[len - 1].length - keysList[len - 1].indexOf('['),
                  ).length,
              )
              if (!schema[propertyName]) {
                schema[propertyName] = []
              }
              // schema[users][0] = value;
              schema[propertyName][
                parseInt(
                  keysList[len - 1].substr(
                    keysList[len - 1].indexOf('[') + 1,
                    keysList[len - 1].indexOf(']') - keysList[len - 1].indexOf('[') - 1,
                  ),
                )
              ] = value
            } else {
              schema[keysList[len - 1]] = value
            }
          }

          const data = editor.getData()
          // formik.values.path = data
          set(formik.values, path, data)
          formik.setValues(formik.values)
        }}
      />
    </div>
  )
}

export default RTE

/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          title: '#040424',
          textP: '#747474',
          hover: '#ECEFF1'
        },
      },

      dark: {
        colors: {
          background: '#161616',
          title: '#ffffff',
          textP: '#aaaaaa',
          hover: '#212121'
        }
      }
    },
  },
})

import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.node, // Dùng môi trường Node.js
        ...globals.es2021
      }
    },
    rules: {
      // === Các rule thường dùng ===
      'no-console': 'off', // Cho phép dùng console.log
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Không cảnh báo biến chưa dùng có tên bắt đầu bằng _
      'eqeqeq': ['error', 'always'], // Bắt buộc dùng === thay vì ==
      'semi': ['error', 'never'], // Bắt buộc không dùng dấu `` (hoặc đổi thành `'always'` nếu bạn thích)
      'quotes': ['error', 'single'], // Dùng dấu nháy đơn
      'indent': ['error', 2], // Thụt lề 2 spaces
      'comma-dangle': ['error', 'only-multiline'], // Dấu `,` cuối dòng khi cần multiline
      'no-multiple-empty-lines': ['error', { max: 1 }], // Không để nhiều dòng trống liên tiếp
      'object-curly-spacing': ['error', 'always'], // Dấu cách trong object literal: { key: value }
    }
  }
])

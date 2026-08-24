import next from 'eslint-config-next'

export default [
  ...next.coreWebVitals,
  {
    rules: {
      'react/no-unescaped-entities': 'off'
    }
  }
]


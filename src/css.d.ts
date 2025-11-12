// https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
declare module 'csstype' {
  interface Properties {
    // Add a CSS Custom Property
    '--block-background'?: string
  }
}

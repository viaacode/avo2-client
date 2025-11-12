export function reactRouterConvert(routingModule: any) {
  const {
    clientLoader,
    clientAction,
    default: Component,
    ...rest
  } = routingModule
  return {
    ...rest,
    loader: clientLoader,
    action: clientAction,
    Component,
  }
}

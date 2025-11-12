export interface GetInteractiveTourResponse {
  app_interactive_tour: {
    steps: {
      id: string
      title: string
      target: string
      content: string
    }[]
    id: number
  }[]
  users_notifications: {
    through_platform: boolean
    key: string
  }[]
}

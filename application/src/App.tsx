
import { Game } from '/src/Game.tsx'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

const App = () => {
    return (
      <QueryClientProvider client={queryClient}>
      <Game />
      </QueryClientProvider>
    )
}

export default App
import { View } from 'react-native'

import { useAuthContext } from '@/hooks/use-auth'
import { Text } from '@/components/ui/text'

export default function HomeScreen() {
  const { profile } = useAuthContext()

  return (
    <View>
      <Text>Welcome, {profile?.name || 'Guest'}!</Text>
    </View>
  )
}
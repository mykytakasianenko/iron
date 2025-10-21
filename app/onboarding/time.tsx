import { View, ScrollView, Pressable, Image } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Link } from "expo-router";

const timeSlots = [
  {
    id: "early-morning",
    title: "Early Morning",
    time: "5:00 - 8:00 AM",
    emoji: "🌅",
    description: "Start your day energized",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80"
  },
  {
    id: "morning",
    title: "Morning",
    time: "8:00 - 12:00 PM",
    emoji: "☀️",
    description: "Beat the afternoon rush",
    image: "https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=400&q=80"
  },
  {
    id: "afternoon",
    title: "Afternoon",
    time: "12:00 - 5:00 PM",
    emoji: "🌤️",
    description: "Midday energy boost",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80"
  },
  {
    id: "evening",
    title: "Evening",
    time: "5:00 - 8:00 PM",
    emoji: "🌆",
    description: "Peak gym hours",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80"
  },
  {
    id: "night",
    title: "Night",
    time: "8:00 - 11:00 PM",
    emoji: "🌙",
    description: "Quiet and focused",
    image: "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=400&q=80"
  },
  {
    id: "flexible",
    title: "Flexible",
    time: "Anytime",
    emoji: "🔄",
    description: "Train when it suits you",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80"
  }
];

export default function SetTimePage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        <View className="pt-8 pb-6">
          <Text className="text-4xl font-bold text-foreground mb-2">
            When Do You Train?
          </Text>
          <Text className="text-base text-muted-foreground">
            Choose your preferred workout time for optimal results
          </Text>
        </View>

        <View className="pb-8 gap-4">
          {timeSlots.map((slot) => (
            <Pressable
              key={slot.id}
              onPress={() => setSelected(slot.id)}
              className={`relative overflow-hidden rounded-2xl h-36 ${selected === slot.id ? "opacity-100" : "opacity-90"
                }`}
            >
              <Image
                source={{ uri: slot.image }}
                className="absolute inset-0 w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black/50" />

              {selected === slot.id && (
                <View className="absolute top-3 right-3 bg-white rounded-full w-8 h-8 items-center justify-center">
                  <Text className="text-lg">✓</Text>
                </View>
              )}

              <View className="flex-1 justify-between p-5">
                <View className="flex-row items-center gap-2">
                  <Text className="text-3xl">{slot.emoji}</Text>
                  <View className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-medium">
                      {slot.time}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text className="text-2xl font-bold text-white mb-1">
                    {slot.title}
                  </Text>
                  <Text className="text-white/80 text-sm">
                    {slot.description}
                  </Text>
                </View>
              </View>

              {selected === slot.id && (
                <View className="absolute inset-0 border-4 border-white rounded-2xl" />
              )}
            </Pressable>
          ))}
        </View>

        {selected && (
          <View className="pb-8">
            <Link href="/auth/register" className="bg-primary rounded-xl py-4 items-center active:opacity-80" asChild>
              <Text className="text-primary-foreground font-semibold text-lg text-center">
                Continue
              </Text>
            </Link>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
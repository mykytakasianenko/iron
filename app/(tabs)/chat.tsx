// app/(tabs)/chat.tsx
import {
  MessageCircle,
  Send,
  Users,
  Sparkles,
} from "lucide-react-native";
import {
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { useChatStore, Message } from "@/state/chat";

export default function ChatScreen() {
  const {
    messages,
    isLoading,
    fetchMessages,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const [userId, setUserId] = useState<string>("");
  const [username, setUsername] = useState<string>("Anonymous");
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadUserAndMessages();
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadUserAndMessages = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);
      // You can fetch username from user metadata or profiles table
      const displayName = user.email?.split("@")[0] || "User";
      setUsername(displayName);
    }

    await fetchMessages();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(userId, username, inputMessage.trim());
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.user_id === userId;
    const messageTime = new Date(item.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View
        className={`mb-4 px-4 ${isCurrentUser ? "items-end" : "items-start"}`}
      >
        {!isCurrentUser && (
          <Text className="text-xs font-semibold text-primary mb-1 ml-2">
            {item.username}
          </Text>
        )}
        <View
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${isCurrentUser
              ? "bg-primary rounded-tr-sm"
              : "bg-card border border-border rounded-tl-sm"
            }`}
        >
          <Text
            className={`text-base ${isCurrentUser ? "text-primary-foreground" : "text-foreground"
              }`}
          >
            {item.message}
          </Text>
          <Text
            className={`text-xs mt-1 ${isCurrentUser
                ? "text-primary-foreground/60"
                : "text-muted-foreground"
              }`}
          >
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View className="px-4 py-3 bg-primary/5 border-b border-border">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="bg-primary rounded-full p-2">
            <Icon as={MessageCircle} size={20} className="text-primary-foreground" />
          </View>
          <View>
            <Text className="text-lg font-bold text-foreground">Global Chat</Text>
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2 bg-green-500 rounded-full" />
              <Text className="text-xs text-muted-foreground">Online</Text>
            </View>
          </View>
        </View>
        <View className="bg-primary/10 rounded-full px-3 py-1.5 flex-row items-center gap-1">
          <Icon as={Users} size={14} className="text-primary" />
          <Text className="text-xs font-semibold text-primary">
            {messages.length > 0 ? new Set(messages.map(m => m.user_id)).size : 0}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="bg-primary/10 rounded-full p-6 mb-4">
        <Icon as={Sparkles} size={48} className="text-primary" />
      </View>
      <Text className="text-xl font-bold text-foreground mb-2 text-center">
        Start the Conversation
      </Text>
      <Text className="text-muted-foreground text-center">
        Be the first to send a message in the global chat!
      </Text>
    </View>
  );

  if (isLoading && messages.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-muted-foreground mt-4">Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {renderHeader()}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 16,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmptyState}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* Input Area */}
        <View className="border-t border-border bg-card/50 backdrop-blur-xl px-4 py-3">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-background border border-border rounded-full flex-row items-center px-4 py-2">
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor="#888"
                value={inputMessage}
                onChangeText={setInputMessage}
                className="flex-1 text-foreground text-base py-1"
                multiline
                maxLength={500}
                onSubmitEditing={handleSendMessage}
                blurOnSubmit={false}
              />
            </View>

            <Pressable
              onPress={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              className={`rounded-full p-3 ${inputMessage.trim() && !isSending
                  ? "bg-primary"
                  : "bg-muted"
                }`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon
                  as={Send}
                  size={20}
                  className={
                    inputMessage.trim()
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }
                />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
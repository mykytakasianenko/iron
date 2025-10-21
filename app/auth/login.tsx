import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
	Image,
	Pressable,
	ScrollView,
	type TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SocialConnections } from "@/components/social-connections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const passwordInputRef = useRef<TextInput>(null);
	const router = useRouter();

	function onEmailSubmitEditing() {
		passwordInputRef.current?.focus();
	}

	async function onSubmit() {
		await supabase.auth.signInWithPassword({
			email,
			password,
		});
	}

	function navigateToRegister() {
		router.replace("/auth/register");
	}

	function navigateToForgotPassword() {
		// TODO: Navigate to forgot password
		console.log("Navigate to forgot password");
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="interactive"
				contentContainerClassName="flex-grow"
			>
				{/* Hero Section with Image */}
				<View className="relative h-64">
					<Image
						source={{
							uri: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
						}}
						className="absolute inset-0 w-full h-full"
						resizeMode="cover"
						blurRadius={3}
					/>
					<View className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
					<View className="flex-1 justify-center items-center px-6">
						<Text className="text-5xl font-bold text-white mb-2">💪</Text>
						<Text className="text-4xl font-bold text-white text-center mb-2">
							Welcome Back
						</Text>
						<Text className="text-white/90 text-center text-base">
							Continue your fitness journey
						</Text>
					</View>
				</View>

				{/* Form Section */}
				<View className="flex-1 px-6 pt-8 pb-6">
					<View className="gap-6">
						{/* Email Input */}
						<View className="gap-2">
							<Label htmlFor="email" className="text-base">
								Email
							</Label>
							<Input
								id="email"
								placeholder="m@example.com"
								keyboardType="email-address"
								autoComplete="email"
								autoCapitalize="none"
								onSubmitEditing={onEmailSubmitEditing}
								returnKeyType="next"
								value={email}
								onChangeText={setEmail}
								className="h-14 text-base"
							/>
						</View>

						{/* Password Input */}
						<View className="gap-2">
							<View className="flex-row items-center justify-between">
								<Label htmlFor="password" className="text-base">
									Password
								</Label>
								<Pressable onPress={navigateToForgotPassword}>
									<Text className="text-primary text-sm font-medium">
										Forgot password?
									</Text>
								</Pressable>
							</View>
							<Input
								ref={passwordInputRef}
								id="password"
								placeholder="Enter your password"
								secureTextEntry
								returnKeyType="send"
								onSubmitEditing={onSubmit}
								value={password}
								onChangeText={setPassword}
								className="h-14 text-base"
							/>
						</View>

						{/* Sign In Button */}
						<Button className="w-full h-14 mt-2" onPress={onSubmit}>
							<Text className="text-base font-semibold">Sign In</Text>
						</Button>

						{/* Sign Up Link */}
						<View className="flex-row justify-center items-center gap-1">
							<Text className="text-muted-foreground text-base">
								Don't have an account?
							</Text>
							<Pressable onPress={navigateToRegister}>
								<Text className="text-primary font-semibold text-base">
									Sign Up
								</Text>
							</Pressable>
						</View>

						{/* Divider */}
						<View className="flex-row items-center gap-4 my-2">
							<Separator className="flex-1" />
							<Text className="text-muted-foreground text-sm">OR</Text>
							<Separator className="flex-1" />
						</View>

						{/* Social Connections */}
						<SocialConnections />
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

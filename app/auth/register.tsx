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

export default function RegisterScreen() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const emailInputRef = useRef<TextInput>(null);
	const passwordInputRef = useRef<TextInput>(null);
	const confirmPasswordInputRef = useRef<TextInput>(null);
	const router = useRouter();

	function onNameSubmitEditing() {
		emailInputRef.current?.focus();
	}

	function onEmailSubmitEditing() {
		passwordInputRef.current?.focus();
	}

	function onPasswordSubmitEditing() {
		confirmPasswordInputRef.current?.focus();
	}

	async function onSubmit() {
		await supabase.auth.signUp({
			email,
			password,
		});
	}

	function navigateToLogin() {
		router.replace("/auth/login");
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="interactive"
				contentContainerClassName="flex-grow"
			>
				{/* Hero Section with Image */}
				<View className="relative h-56">
					<Image
						source={{
							uri: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
						}}
						className="absolute inset-0 w-full h-full"
						resizeMode="cover"
						blurRadius={3}
					/>
					<View className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
					<View className="flex-1 justify-center items-center px-6">
						<Text className="text-5xl font-bold text-white mb-2">🚀</Text>
						<Text className="text-4xl font-bold text-white text-center mb-2">
							Start Your Journey
						</Text>
						<Text className="text-white/90 text-center text-base">
							Create an account to track your progress
						</Text>
					</View>
				</View>

				{/* Form Section */}
				<View className="flex-1 px-6 pt-8 pb-6">
					<View className="gap-5">
						{/* Name Input */}
						<View className="gap-2">
							<Label htmlFor="name" className="text-base">
								Full Name
							</Label>
							<Input
								id="name"
								placeholder="John Doe"
								autoComplete="name"
								autoCapitalize="words"
								onSubmitEditing={onNameSubmitEditing}
								returnKeyType="next"
								value={name}
								onChangeText={setName}
								className="h-14 text-base"
							/>
						</View>

						{/* Email Input */}
						<View className="gap-2">
							<Label htmlFor="email" className="text-base">
								Email
							</Label>
							<Input
								ref={emailInputRef}
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
							<Label htmlFor="password" className="text-base">
								Password
							</Label>
							<Input
								ref={passwordInputRef}
								id="password"
								placeholder="Create a strong password"
								secureTextEntry
								returnKeyType="next"
								onSubmitEditing={onPasswordSubmitEditing}
								value={password}
								onChangeText={setPassword}
								className="h-14 text-base"
							/>
						</View>

						{/* Confirm Password Input */}
						<View className="gap-2">
							<Label htmlFor="confirm-password" className="text-base">
								Confirm Password
							</Label>
							<Input
								ref={confirmPasswordInputRef}
								id="confirm-password"
								placeholder="Re-enter your password"
								secureTextEntry
								returnKeyType="send"
								onSubmitEditing={onSubmit}
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								className="h-14 text-base"
							/>
						</View>

						{/* Terms and Conditions */}
						<Text className="text-muted-foreground text-sm text-center px-2">
							By signing up, you agree to our{" "}
							<Text className="text-primary font-medium">Terms of Service</Text>{" "}
							and{" "}
							<Text className="text-primary font-medium">Privacy Policy</Text>
						</Text>

						{/* Sign Up Button */}
						<Button className="w-full h-14" onPress={onSubmit}>
							<Text className="text-base font-semibold">Create Account</Text>
						</Button>

						{/* Sign In Link */}
						<View className="flex-row justify-center items-center gap-1">
							<Text className="text-muted-foreground text-base">
								Already have an account?
							</Text>
							<Pressable onPress={navigateToLogin}>
								<Text className="text-primary font-semibold text-base">
									Sign In
								</Text>
							</Pressable>
						</View>

						{/* Divider */}
						<View className="flex-row items-center gap-4 my-1">
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

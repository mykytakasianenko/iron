import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, type TextInput, View } from "react-native";
import { SocialConnections } from "@/components/social-connections";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";

export function SignUpForm() {
	const passwordInputRef = React.useRef<TextInput>(null);
	const router = useRouter();
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");

	async function onSubmit() {
		const { error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			console.log("Error signing up:", error.message);
		}
	}

	return (
		<View className="gap-6">
			<Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
				<CardHeader>
					<CardTitle className="text-center text-xl sm:text-left">
						Create your account
					</CardTitle>
					<CardDescription className="text-center sm:text-left">
						Welcome! Please fill in the details to get started.
					</CardDescription>
				</CardHeader>
				<CardContent className="gap-6">
					<View className="gap-6">
						<View className="gap-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								placeholder="m@example.com"
								keyboardType="email-address"
								autoComplete="email"
								autoCapitalize="none"
								onSubmitEditing={() => {
									passwordInputRef.current?.focus();
								}}
								returnKeyType="next"
								submitBehavior="submit"
								onChangeText={(text) => setEmail(text)}
							/>
						</View>
						<View className="gap-1.5">
							<View className="flex-row items-center">
								<Label htmlFor="password">Password</Label>
							</View>
							<Input
								ref={passwordInputRef}
								id="password"
								secureTextEntry
								returnKeyType="send"
								onSubmitEditing={onSubmit}
								onChangeText={(text) => setPassword(text)}
							/>
						</View>
						<Button className="w-full" onPress={onSubmit}>
							<Text>Continue</Text>
						</Button>
					</View>
					<Text className="text-center text-sm">
						Already have an account?{" "}
						<Pressable
							onPress={() => {
								router.push("/auth/login");
							}}
						>
							<Text className="text-sm underline underline-offset-4">
								Sign in
							</Text>
						</Pressable>
					</Text>
					<View className="flex-row items-center">
						<Separator className="flex-1" />
						<Text className="text-muted-foreground px-4 text-sm">or</Text>
						<Separator className="flex-1" />
					</View>
					<SocialConnections />
				</CardContent>
			</Card>
		</View>
	);
}

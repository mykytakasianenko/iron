import {
	Calendar,
	ChevronRight,
	LogOut,
	Settings,
	Target,
	Trophy,
	User,
	Camera,
} from "lucide-react-native";
import { Pressable, ScrollView, View, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/state/profile";

const menuItems = [
	{
		id: "personal",
		title: "Personal Information",
		icon: User,
		description: "Update your details",
	},
	{
		id: "goals",
		title: "Fitness Goals",
		icon: Target,
		description: "Manage your objectives",
	},
	{
		id: "achievements",
		title: "Achievements",
		icon: Trophy,
		description: "View your milestones",
	},
	{
		id: "schedule",
		title: "Workout Schedule",
		icon: Calendar,
		description: "Manage your routine",
	},
	{
		id: "settings",
		title: "Settings",
		icon: Settings,
		description: "App preferences",
	},
];

const stats = [
	{ label: "Workouts", value: "48" },
	{ label: "Streak", value: "12" },
	{ label: "Goal", value: "Legs" },
];

export default function ProfileScreen() {
	const { profile, fetchProfile, uploadAvatar, isLoading } = useProfileStore();
	const [uploadingAvatar, setUploadingAvatar] = useState(false);

	useEffect(() => {
		loadProfile();
	}, []);

	const loadProfile = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (user) {
			await fetchProfile(user.id);
		}
	};

	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};

	const handleMenuPress = (id: string) => {
		console.log("Navigate to:", id);
		// TODO: Navigate to specific screen
	};

	const pickImage = async () => {
		try {
			// Request permissions
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (status !== "granted") {
				Alert.alert(
					"Permission Required",
					"Please grant camera roll permissions to upload a photo."
				);
				return;
			}

			// Pick image
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});

			if (!result.canceled && profile) {
				setUploadingAvatar(true);

				const asset = result.assets[0];
				const avatarUrl = await uploadAvatar(
					profile.id,
					asset.uri,
					asset.mimeType || "image/jpeg"
				);

				if (avatarUrl) {
					Alert.alert("Success", "Profile photo updated!");
				} else {
					Alert.alert("Error", "Failed to upload photo. Please try again.");
				}

				setUploadingAvatar(false);
			}
		} catch (error) {
			console.error("Error picking image:", error);
			Alert.alert("Error", "Failed to pick image. Please try again.");
			setUploadingAvatar(false);
		}
	};

	const displayName = profile?.full_name || profile?.username || "User";
	const displayEmail = profile?.id ? `${profile.id.slice(0, 8)}...` : "Loading...";

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1">
				<View className="items-center pt-6 pb-8 px-6">
					{/* Avatar */}
					<View className="relative mb-4">
						<Pressable onPress={pickImage} disabled={uploadingAvatar}>
							<View className="w-28 h-28 rounded-full bg-primary/20 items-center justify-center border-4 border-primary/30 overflow-hidden">
								{uploadingAvatar ? (
									<ActivityIndicator size="large" color="#8B5CF6" />
								) : profile?.avatar_url ? (
									<Image
										source={{ uri: profile.avatar_url }}
										className="w-full h-full"
										resizeMode="cover"
									/>
								) : (
									<Text className="text-5xl">💪</Text>
								)}
							</View>
							<View className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-4 border-background">
								<Icon
									as={Camera}
									size={16}
									className="text-primary-foreground"
								/>
							</View>
						</Pressable>
					</View>

					{/* User Info */}
					<Text className="text-2xl font-bold text-foreground mb-1">
						{displayName}
					</Text>
					<Text className="text-muted-foreground text-base mb-6">
						{displayEmail}
					</Text>

					{/* Stats */}
					<View className="flex-row gap-4 w-full max-w-sm">
						{stats.map((stat, index) => (
							<View
								key={index}
								className="flex-1 bg-muted/50 rounded-xl p-4 items-center"
							>
								<Text className="text-2xl font-bold text-foreground mb-1">
									{stat.value}
								</Text>
								<Text className="text-muted-foreground text-sm">
									{stat.label}
								</Text>
							</View>
						))}
					</View>
				</View>

				{/* Menu Items */}
				<View className="px-6 pb-6">
					<View className="gap-2">
						{menuItems.map((item) => (
							<Pressable
								key={item.id}
								onPress={() => handleMenuPress(item.id)}
								className="flex-row items-center bg-card border border-border rounded-xl p-4 active:opacity-70"
							>
								<View className="bg-primary/10 rounded-full p-2.5 mr-4">
									<Icon as={item.icon} size={20} className="text-primary" />
								</View>
								<View className="flex-1">
									<Text className="text-foreground font-semibold text-base mb-0.5">
										{item.title}
									</Text>
									<Text className="text-muted-foreground text-sm">
										{item.description}
									</Text>
								</View>
								<Icon
									as={ChevronRight}
									size={20}
									className="text-muted-foreground"
								/>
							</Pressable>
						))}
					</View>
				</View>

				{/* Sign Out Button */}
				<View className="px-6 pb-8">
					<Button
						variant="destructive"
						className="w-full h-14 flex-row items-center gap-2"
						onPress={handleSignOut}
					>
						<Icon as={LogOut} className="text-destructive-foreground" />
						<Text className="text-base font-semibold">Sign Out</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
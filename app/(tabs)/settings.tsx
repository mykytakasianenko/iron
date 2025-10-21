import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";

export default function Settings() {
	return (
		<View>
			<Button onPress={() => supabase.auth.signOut()}>
				<Text>Sign out</Text>
			</Button>
		</View>
	);
}

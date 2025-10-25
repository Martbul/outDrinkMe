import { useAuth } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity } from "react-native";

export default function DeleteAccountButton() {
   const { signOut } = useAuth();
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const handleLogout = async () => {
     if (isLoading) return;

     Alert.alert(
       "Logout",
       "Are you sure you want to logout?",
       [
         {
           text: "Cancel",
           style: "cancel",
         },
         {
           text: "Logout",
           style: "destructive",
           onPress: async () => {
             try {
               setIsLoading(true);
               await signOut();


               router.replace("/(auth)/google-sign-in");
             } catch (error: any) {
               console.error("Logout error:", error);
               Alert.alert(
                 "Logout Error",
                 error?.message || "Failed to logout. Please try again."
               );
             } finally {
               setIsLoading(false);
             }
           },
         },
       ],
       { cancelable: true }
     );
   };
   return (
     <TouchableOpacity
       className="bg-red-900/20 rounded-2xl p-5 border border-red-900/50 flex-row justify-between items-center"
       onPress={handleLogout}
       disabled={isLoading}
     >
       {isLoading ? (
         <ActivityIndicator size="small" color="#EF4444" />
       ) : (
         <>
           <Text className="text-red-500 font-bold">Logout</Text>
           <Feather name="arrow-right" size={24} color="#EF4444" />
         </>
       )}
     </TouchableOpacity>
   );
}
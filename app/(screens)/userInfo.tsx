import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Share, Text, TouchableOpacity, View } from "react-native";


export const UserInfoScreen = ({ friendData = {
  name: 'Sarah Johnson',
  username: '@sarahj',
  level: 4,
  currentStreak: 12,
  bestStreak: 18,
  totalDays: 156,
  rank: 1,
  daysThisWeek: 6,
  isFriend: true
}}) => {
   const [isFriend, setIsFriend] = useState(friendData.isFriend);
   const { friendId } = useLocalSearchParams();


  const handleAddFriend = () => {
    setIsFriend(true);
    // API call here
  };

  const handleRemoveFriend = () => {
    setIsFriend(false);
    // API call here
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${friendData.name}'s profile on outDrinkMe!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center pt-8 pb-6 px-4">
          {/* Avatar with Level */}
          <View className="relative mb-4">
            <View className="w-32 h-32 rounded-full bg-orange-600 items-center justify-center border-4 border-black">
              <Text className="text-black text-5xl font-black">
                {friendData.name[0]}
              </Text>
            </View>
            {/* Level Badge */}
            <View className="absolute -bottom-2 left-1/2 -ml-8 bg-gray-900 px-4 py-1 rounded-full border-2 border-orange-600">
              <Text className="text-orange-500 text-sm font-black">
                LV. {friendData.level}
              </Text>
            </View>
          </View>

          {/* Name & Username */}
          <Text className="text-white text-2xl font-black mb-1">
            {friendData.name}
          </Text>
          <Text className="text-gray-500 text-base mb-6">
            {friendData.username}
          </Text>

          {/* Action Buttons */}
          <View className="flex-row gap-3 w-full px-4">
            {isFriend ? (
              <>
                <TouchableOpacity
                  onPress={handleRemoveFriend}
                  className="flex-1 bg-gray-900 py-4 rounded-xl border border-gray-800"
                >
                  <Text className="text-white font-bold text-center uppercase tracking-wider text-sm">
                    Remove
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleShare}
                  className="flex-1 bg-orange-600 py-4 rounded-xl"
                >
                  <Text className="text-black font-bold text-center uppercase tracking-wider text-sm">
                    Share
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                onPress={handleAddFriend}
                className="flex-1 bg-orange-600 py-4 rounded-xl"
              >
                <Text className="text-black font-bold text-center uppercase tracking-wider text-sm">
                  Add Friend
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-4 mb-6">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-gray-900 rounded-2xl p-5 border border-gray-800 items-center">
              <Text className="text-orange-500 text-4xl font-black mb-1">
                {friendData.currentStreak}
              </Text>
              <Text className="text-gray-400 text-xs uppercase tracking-wider">
                Current Streak
              </Text>
            </View>
            <View className="flex-1 bg-gray-900 rounded-2xl p-5 border border-gray-800 items-center">
              <Text className="text-white text-4xl font-black mb-1">
                {friendData.bestStreak}
              </Text>
              <Text className="text-gray-400 text-xs uppercase tracking-wider">
                Best Streak
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-900 rounded-2xl p-5 border border-gray-800 items-center">
              <Text className="text-white text-4xl font-black mb-1">
                {friendData.totalDays}
              </Text>
              <Text className="text-gray-400 text-xs uppercase tracking-wider">
                Total Days
              </Text>
            </View>
            <View className="flex-1 bg-gray-900 rounded-2xl p-5 border border-gray-800 items-center">
              <Text className="text-white text-4xl font-black mb-1">
                #{friendData.rank}
              </Text>
              <Text className="text-gray-400 text-xs uppercase tracking-wider">
                Current Rank
              </Text>
            </View>
          </View>
        </View>

        {/* This Week */}
        <View className="px-4 mb-6">
          <View className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <Text className="text-gray-400 text-xs uppercase tracking-wider mb-4">
              This Week
            </Text>
            <View className="flex-row justify-between mb-3">
              <Text className="text-white text-3xl font-black">
                {friendData.daysThisWeek}/7
              </Text>
              <Text className="text-gray-500 text-sm">Days Logged</Text>
            </View>
            <View className="w-full h-2 bg-gray-800 rounded-full">
              <View 
                className="h-full bg-orange-600 rounded-full" 
                style={{ width: `${(friendData.daysThisWeek / 7) * 100}%` }} 
              />
            </View>
          </View>
        </View>

        {/* Achievements Section */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-black">Achievements</Text>
            <Text className="text-gray-500 text-sm">5/8</Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {[
              { icon: '🔥', unlocked: true },
              { icon: '👑', unlocked: true },
              { icon: '⚡', unlocked: true },
              { icon: '💯', unlocked: true },
              { icon: '🏆', unlocked: true },
              { icon: '🌟', unlocked: false },
            ].map((achievement, index) => (
              <View
                key={index}
                className={`w-[30%] aspect-square rounded-2xl items-center justify-center border ${
                  achievement.unlocked
                    ? 'bg-orange-600/20 border-orange-600/50'
                    : 'bg-gray-900 border-gray-800'
                }`}
              >
                <Text className={`text-5xl ${!achievement.unlocked && 'opacity-30'}`}>
                  {achievement.icon}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Head to Head */}
        <View className="px-4 mb-24">
          <Text className="text-white text-xl font-black mb-4">Head to Head</Text>
          
          <View className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <View className="flex-row items-center justify-between mb-4">
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-xs mb-2">YOU</Text>
                <Text className="text-white text-3xl font-black">5</Text>
              </View>
              
              <Text className="text-gray-600 text-xl font-black px-4">VS</Text>
              
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-xs mb-2">
                  {friendData.name.split(' ')[0].toUpperCase()}
                </Text>
                <Text className="text-orange-500 text-3xl font-black">
                  {friendData.daysThisWeek}
                </Text>
              </View>
            </View>
            
            <Text className="text-center text-gray-500 text-sm">
              {friendData.daysThisWeek > 5 
                ? `${friendData.name.split(' ')[0]} is ahead this week!` 
                : 'You\'re ahead this week!'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Example Usage Component
export default function ProfileScreenExample() {
  const [viewingOwnProfile, setViewingOwnProfile] = useState(true);

  return (
    <View className="flex-1 bg-black">
      {/* Toggle for demo */}
      <View className="bg-gray-900 p-4 flex-row justify-center gap-4">
        <TouchableOpacity
          onPress={() => setViewingOwnProfile(true)}
          className={`px-6 py-2 rounded-xl ${viewingOwnProfile ? 'bg-orange-600' : 'bg-gray-800'}`}
        >
          <Text className={`font-bold ${viewingOwnProfile ? 'text-black' : 'text-gray-400'}`}>
            My Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewingOwnProfile(false)}
          className={`px-6 py-2 rounded-xl ${!viewingOwnProfile ? 'bg-orange-600' : 'bg-gray-800'}`}
        >
          <Text className={`font-bold ${!viewingOwnProfile ? 'text-black' : 'text-gray-400'}`}>
            Friend Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
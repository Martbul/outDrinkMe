import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SecondaryHeader from "@/components/secondaryHeader";

interface Deal {
  id: number;
  title: string;
  type: string;
  discount: string;
  originalPrice: number;
  price: number;
  multiplier?: string;
  image: any;
  isDark?: boolean;
  featured?: boolean;
}

interface ProDeal {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  originalPrice: number;
  price: number;
  image: any;
}

interface Flag {
  id: number;
  title: string;
  // type: string;
  price: number;
  image: any;
  color: string;
}

interface Smoking {
  id: number;
  title: string;
  price: number;
  image: any;
  color: string;
}


interface ColorTheme {
  id: number;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  price: number;
}

interface GemPack {
  id: number;
  amount: number;
  price: string;
  image: any;
  bonus?: number;
}

export default function LiftoffStoreScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [gemsBalance, setGemsBalance] = useState(250); // TODO: Get from API

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Refresh store data from API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const regularDeals: Deal[] = [
    {
      id: 1,
      title: "Double-XP Shake",
      type: "Consumable",
      discount: "33%",
      originalPrice: 40,
      price: 27,
      multiplier: "2x",
      image: require("@/assets/images/flags/beer_flag.jpg"),
      featured: true,
    },
    {
      id: 2,
      title: "Autumn Vibes",
      type: "Seasonal",
      discount: "25%",
      originalPrice: 150,
      price: 113,
      image: require("@/assets/images/flags/beer_flag.jpg"),
      isDark: true,
    },
    {
      id: 3,
      title: "Winter Pack",
      type: "Seasonal",
      discount: "40%",
      originalPrice: 200,
      price: 120,
      image: require("@/assets/images/flags/beer_flag.jpg"),
    },
  ];

  const proDeals: ProDeal[] = [
    {
      id: 1,
      title: "Fire",
      subtitle: "Profile Border",
      discount: "33%",
      originalPrice: 500,
      price: 334,
      image: require("@/assets/images/flags/beer_flag.jpg"),
    },
    {
      id: 2,
      title: "Water",
      subtitle: "Profile Border",
      discount: "50%",
      originalPrice: 500,
      price: 250,
      image: require("@/assets/images/flags/beer_flag.jpg"),
    },
    {
      id: 3,
      title: "Lightning",
      subtitle: "Profile Border",
      discount: "45%",
      originalPrice: 500,
      price: 275,
      image: require("@/assets/images/flags/beer_flag.jpg"),
    },
  ];

 

  const flags: Flag[] = [
    {
      id: 1,
      title: "Beersexual",
      // type: "Flag",
      // days: 30,
      price: 10,
      image: require("@/assets/images/flags/beer_flag.jpg"),
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Winesexual",
      // type: "Consumable",
      // days: 90,
      price: 10,
      image: require("@/assets/images/flags/wine_flag.png"),
      color: "bg-purple-500",
    },

    {
      id: 3,
      title: "Vodkasexual",
      // type: "Consumable",
      // days: 90,
      price: 10,
      image: require("@/assets/images/flags/vodka_flag.png"),
      color: "bg-purple-500",
    },
    {
      id: 4,
      title: "Whiskeysexual",
      // type: "Consumable",
      // days: 90,
      price: 15,
      image: require("@/assets/images/flags/whiskey_flag.png"),
      color: "bg-purple-500",
    },
    {
      id: 5,
      title: "Jagersexual",
      // type: "Consumable",
      // days: 60,
      price: 20,
      image: require("@/assets/images/flags/jager_flag.png"),
      color: "bg-red-500",
    },
    {
      id: 6,
      title: "Tequilasexual",
      // type: "Consumable",
      // days: 90,
      price: 25,
      image: require("@/assets/images/flags/tequila_flag.png"),
      color: "bg-purple-500",
    },
  ];


  const smokingDevices: Smoking[] = [
    {
      id: 1,
      title: "Vape",
      price: 5,
      image: require("@/assets/images/smoking/vape.png"),
      color: "bg-purple-500",
    },
    {
      id: 2,
      title: "Cigarettes",
      price: 15,
      image: require("@/assets/images/smoking/cigarettes.png"),
      color: "bg-purple-500",
    },
    {
      id: 3,
      title: "Fat Cigar",
      price: 25,
      image: require("@/assets/images/smoking/cigar.png"),
      color: "bg-purple-500",
    },
    {
      id: 4,
      title: "Weed",
      price: 40,
      image: require("@/assets/images/smoking/weed.png"),
      color: "bg-purple-500",
    },
    
  ];

  const colorThemes: ColorTheme[] = [
    {
      id: 1,
      name: "Cherry Dark",
      color: "bg-red-500",
      bgColor: "bg-[#2a1a1a]",
      borderColor: "border-red-900/50",
      price: 125,
    },
    {
      id: 2,
      name: "Lime Dark",
      color: "bg-green-500",
      bgColor: "bg-[#1a2a1a]",
      borderColor: "border-green-900/50",
      price: 125,
    },
    {
      id: 3,
      name: "Ocean Dark",
      color: "bg-blue-500",
      bgColor: "bg-[#1a1a2a]",
      borderColor: "border-blue-900/50",
      price: 125,
    },
    {
      id: 4,
      name: "Purple Dark",
      color: "bg-purple-500",
      bgColor: "bg-[#2a1a2a]",
      borderColor: "border-purple-900/50",
      price: 125,
    },
  ];

  const gemPacks: GemPack[] = [
    {
      id: 1,
      amount: 3,
      price: "3,69 лв.",
      image: require("@/assets/images/flags/beer_flag.jpg"),
    },
    {
      id: 2,
      amount: 10,
      price: "9,99 лв.",
      image: require("@/assets/images/flags/beer_flag.jpg"),
    },
    {
      id: 3,
      amount: 15,
      price: "15,99 лв.",
      image: require("@/assets/images/flags/beer_flag.jpg"),
      bonus: 3,
    },
    {
      id: 4,
      amount: 20,
      price: "20,99 лв.",
      image: require("@/assets/images/flags/beer_flag.jpg"),
      bonus: 5,
    },
    {
      id: 5,
      amount: 50,
      price: "40,99 лв.",
      image: require("@/assets/images/flags/beer_flag.jpg"),
      bonus: 10,
    },
  ];

  const DealCard = ({ deal }: { deal: Deal }) => (
    <TouchableOpacity
      className={`rounded-2xl p-4 border mr-3 ${
        deal.featured
          ? "bg-orange-600/10 border-orange-600/50"
          : deal.isDark
            ? "bg-[#2a1a1a] border-[#3a2424]"
            : "bg-white/[0.03] border-white/[0.08]"
      }`}
      style={{ width: 160 }}
      activeOpacity={0.7}
    >
      {/* Discount Badge */}
      <View className="absolute -top-2 -left-2 bg-orange-600 px-3 py-1 rounded-lg border-2 border-black z-10">
        <Text className="text-white text-xs font-black">{deal.discount}</Text>
        <Text className="text-white text-[10px] font-bold">OFF</Text>
      </View>

      {deal.featured && (
        <View className="absolute -top-2 -right-2 bg-yellow-600 px-2 py-1 rounded-lg border-2 border-black z-10">
          <Text className="text-black text-[10px] font-black">HOT</Text>
        </View>
      )}

      {/* Title */}
      <Text
        className="text-white text-sm font-bold mt-2 mb-1"
        numberOfLines={1}
      >
        {deal.title}
      </Text>
      <Text
        className={`text-xs font-semibold mb-3 ${
          deal.isDark ? "text-pink-500" : "text-white/50"
        }`}
      >
        {deal.type}
      </Text>

      {/* Image */}
      <View className="items-center justify-center py-4 relative bg-black/20 rounded-xl">
        <Image
          source={deal.image}
          style={{ width: 60, height: 60 }}
          resizeMode="contain"
        />
        {deal.multiplier && (
          <View className="absolute -bottom-2 -right-2 bg-blue-500 w-8 h-8 rounded-full items-center justify-center border-2 border-black">
            <Text className="text-white text-xs font-black">
              {deal.multiplier}
            </Text>
          </View>
        )}
      </View>

      {/* Prices */}
      <Text className="text-white/30 text-sm text-center line-through mb-2 mt-3">
        {deal.originalPrice}
      </Text>
      <View className="bg-orange-600/20 rounded-xl py-2 px-3 flex-row items-center justify-center border border-orange-600/40">
        <MaterialCommunityIcons
          name="diamond-stone"
          size={18}
          color="#EA580C"
        />
        <Text className="text-orange-600 text-lg font-black ml-1">
          {deal.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ProDealCard = ({ deal }: { deal: ProDeal }) => (
    <TouchableOpacity
      className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mr-3"
      style={{ width: 160 }}
      activeOpacity={0.7}
    >
      {/* Discount Badge */}
      <View className="absolute -top-2 -left-2 bg-orange-600 px-3 py-1 rounded-lg border-2 border-black z-10">
        <Text className="text-white text-xs font-black">{deal.discount}</Text>
        <Text className="text-white text-[10px] font-bold">OFF</Text>
      </View>

      {/* PRO Badge */}
      <View className="absolute -top-2 -right-2 bg-purple-600 px-2 py-1 rounded-lg border-2 border-black z-10">
        <Text className="text-white text-[10px] font-black">PRO</Text>
      </View>

      {/* Title */}
      <Text
        className="text-white text-sm font-bold mt-2 mb-1"
        numberOfLines={1}
      >
        {deal.title}
      </Text>
      <Text className="text-white/50 text-xs font-semibold mb-3">
        {deal.subtitle}
      </Text>

      {/* Image with MB Badge */}
      <View className="items-center justify-center py-4 bg-black/20 rounded-xl">
        <Image
          source={deal.image}
          style={{ width: 60, height: 60 }}
          resizeMode="contain"
        />
        <View className="bg-orange-600/20 px-3 py-1 rounded-full mt-2 border border-orange-600/40">
          <Text className="text-orange-600 text-xs font-black">MB</Text>
        </View>
      </View>

      {/* Prices */}
      <Text className="text-white/30 text-sm text-center line-through mb-2 mt-3">
        {deal.originalPrice}
      </Text>
      <View className="bg-orange-600/20 rounded-xl py-2 px-3 flex-row items-center justify-center border border-orange-600/40">
        <MaterialCommunityIcons
          name="diamond-stone"
          size={18}
          color="#EA580C"
        />
        <Text className="text-orange-600 text-lg font-black ml-1">
          {deal.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const SmokingCard = ({ device }: { device: Smoking }) => (
    <TouchableOpacity
      className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] items-center mr-3"
      style={{ width: 140 }}
      activeOpacity={0.7}
    >
      <Text className="text-white text-sm font-bold mb-1" numberOfLines={1}>
        {device.title}
      </Text>
      <View className="bg-black/20 rounded-xl p-3 w-full items-center mb-3">
        <Image
          source={device.image}
          style={{ width: 50, height: 50 }}
          resizeMode="contain"
        />
      </View>

      <View className="bg-orange-600/20 rounded-xl py-2 px-3 flex-row items-center justify-center border border-orange-600/40 w-full">
        <MaterialCommunityIcons
          name="diamond-stone"
          size={16}
          color="#EA580C"
        />
        <Text className="text-orange-600 text-lg font-black ml-1">
          {device.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const FlagCard = ({ item }: { item: Flag }) => (
    <TouchableOpacity
      className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mr-3"
      style={{ width: 160 }}
      activeOpacity={0.7}
    >
      <Text className="text-white text-sm font-bold mb-1" numberOfLines={1}>
        {item.title}
      </Text>
      {/* <Text className="text-white/50 text-xs font-semibold mb-4">
        {item.type}
      </Text> */}
      <View className="items-center py-4 bg-black/20 rounded-xl">
        <Image
          source={item.image}
          style={{ width: 170, height: 70 }}
          resizeMode="contain"
        />
        {/* <View
          className={`${item.color} w-12 h-12 rounded-full items-center justify-center mt-3 border-2 border-white/20`}
        >
          <Text className="text-white text-sm font-black">{item.days}</Text>
          <Text className="text-white text-[8px] font-bold">DAYS</Text>
        </View> */}
      </View>
      <View className="bg-orange-600/20 rounded-xl py-2 px-3 flex-row items-center justify-center border border-orange-600/40 mt-3">
        <MaterialCommunityIcons
          name="diamond-stone"
          size={16}
          color="#EA580C"
        />
        <Text className="text-orange-600 text-lg font-black ml-1">
          {item.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ColorThemeCard = ({ theme }: { theme: ColorTheme }) => (
    <TouchableOpacity
      className={`${theme.bgColor} rounded-2xl p-4 border ${theme.borderColor} mr-3`}
      style={{ width: 160 }}
      activeOpacity={0.7}
    >
      <View
        className={`w-16 h-16 rounded-2xl ${theme.color} mb-3 items-center justify-center`}
      >
        <View className={`w-12 h-12 rounded-xl ${theme.color} opacity-60`} />
      </View>
      <Text className="text-white font-bold mb-1" numberOfLines={1}>
        {theme.name}
      </Text>
      <Text
        className={`text-xs font-semibold mb-3`}
        style={{ color: theme.color.replace("bg-", "#") }}
      >
        Theme Color
      </Text>
      <View className="bg-orange-600/20 rounded-xl py-2 px-3 flex-row items-center justify-center border border-orange-600/40">
        <MaterialCommunityIcons
          name="diamond-stone"
          size={14}
          color="#EA580C"
        />
        <Text className="text-orange-600 text-base font-black ml-1">
          {theme.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const GemPackCard = ({ pack }: { pack: GemPack }) => (
    <TouchableOpacity
      className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] items-center mr-3 relative"
      style={{ width: 140 }}
      activeOpacity={0.7}
    >
      {pack.bonus && (
        <View className="absolute -top-2 -right-2 bg-[#ff8c00] px-2 py-1 rounded-lg border-2 border-black z-10">
          <Text className="text-black text-[9px] font-black">
            +{pack.bonus}
          </Text>
        </View>
      )}
      <View className="bg-orange-600/20 rounded-2xl w-20 h-20 items-center justify-center mb-3 border border-orange-600/40">
        <MaterialCommunityIcons
          name="diamond-stone"
          size={48}
          color="#EA580C"
        />
      </View>
      <View className="bg-orange-600/20 rounded-xl py-2 px-3 flex-row items-center justify-center border border-orange-600/40 w-full mb-2">
        <Text className="text-orange-600 text-xl font-black">
          {pack.amount}
        </Text>
        {pack.bonus && (
          <Text className="text-[#ff8c00] text-sm font-black ml-1">
            +{pack.bonus}
          </Text>
        )}
      </View>
      <Text className="text-white/50 text-sm font-bold">{pack.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SecondaryHeader title="Store" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
            colors={["#EA580C"]}
          />
        }
      >
        {/* Gems Balance Header */}
        <View className="mx-4 mt-4 ">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
                  YOUR BALANCE
                </Text>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="diamond-stone"
                    size={32}
                    color="#EA580C"
                  />
                  <Text className="text-white text-3xl font-black ml-2">
                    {gemsBalance}
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="bg-orange-600 px-5 py-3 rounded-xl">
                <Text className="text-black text-sm font-black">GET MORE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* <View className="mt-2">
          <View className="mx-4 mb-4 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
                  LIMITED TIME
                </Text>
                <Text className="text-white text-2xl font-black">
                  Regular Deals
                </Text>
              </View>
              <View className="bg-orange-600/20 px-3 py-2 rounded-xl flex-row items-center border border-orange-600/40">
                <Ionicons name="time-outline" size={16} color="#EA580C" />
                <Text className="text-orange-600 text-xs font-black ml-1">
                  16h 25m
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {regularDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </ScrollView>
        </View> */}

        {/* <View className="mt-6">
          <View className="mx-4 mb-4 bg-white/[0.03] rounded-2xl p-5 border border-purple-600/30">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-purple-600 text-[11px] font-bold tracking-widest mb-1">
                  EXCLUSIVE
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-white text-2xl font-black mr-2">
                    Pro Deals
                  </Text>
                  <Ionicons name="lock-closed" size={20} color="#9333ea" />
                </View>
              </View>
              <TouchableOpacity className="bg-purple-600 px-4 py-2 rounded-xl">
                <Text className="text-white text-xs font-black">UNLOCK</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {proDeals.map((deal) => (
              <ProDealCard key={deal.id} deal={deal} />
            ))}
          </ScrollView>
        </View> */}

        {/* //TODO: Implement the bonus */}
        <View className="mx-4 mt-4">
          <TouchableOpacity
            className="bg-orange-600/10 rounded-2xl p-5 border-2 border-orange-600/50"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <View className="bg-[#ff8c00] px-2 py-1 rounded-lg mr-2">
                    <Text className="text-black text-[10px] font-black">
                      REFERRAL BONUS
                    </Text>
                  </View>
                </View>
                <Text className="text-white text-xl font-black mb-1">
                  Invite Friends
                </Text>
                <Text className="text-white/70 text-sm font-semibold mb-3">
                  Get 3 gems for each friend who joins!
                </Text>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="diamond-stone"
                    size={20}
                    color="#EA580C"
                  />
                  <Text className="text-[#ff8c00] text-2xl font-black ml-1">
                    +3
                  </Text>
                  <Text className="text-white/50 text-sm font-semibold ml-2">
                    per friend
                  </Text>
                </View>
              </View>
              <View className="items-center ml-3">
                <View className="bg-[#ff8c00] w-16 h-16 rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="people" size={32} color="black" />
                </View>
                <View className="bg-[#ff8c00] px-4 py-2 rounded-xl">
                  <Text className="text-black text-xs font-black">INVITE</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          <View className="mx-4 mb-4 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
              BOOST YOUR HEALTH
            </Text>
            <Text className="text-white text-2xl font-black">Smoking</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {smokingDevices.map((device) => (
              <SmokingCard key={device.id} device={device} />
            ))}
          </ScrollView>
        </View>

        {/* Flags (Restore Items) Section */}
        <View className="mt-6">
          <View className="mx-4 mb-4 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
              SEXUALITY
            </Text>
            <Text className="text-white text-2xl font-black">Flags</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {flags.map((item) => (
              <FlagCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        {/* <View className="mt-6">
          <View className="mx-4 mb-4 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
              PERSONALIZE
            </Text>
            <Text className="text-white text-2xl font-black">Color Themes</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {colorThemes.map((theme) => (
              <ColorThemeCard key={theme.id} theme={theme} />
            ))}
          </ScrollView>
        </View> */}

        {/* Get More Gems Section */}
        <View className="mt-6 mb-6">
          <View className="mx-4 mb-4 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 rounded-2xl p-5 border border-orange-600/40">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
              SPECIAL OFFER
            </Text>
            <Text className="text-white text-2xl font-black">
              Get More Gems!
            </Text>
            <Text className="text-white/50 text-xs font-semibold mt-1">
              Best value bundles with bonus gems
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {gemPacks.map((pack) => (
              <GemPackCard key={pack.id} pack={pack} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

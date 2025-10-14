// import { Text, TouchableOpacity, View } from "react-native";

// export default function BottomNav({ activeScreen, onNavigate }) {
//   const navItems = [
//     { id: "home", icon: "🏠", label: "Home" },
//     { id: "battle", icon: "⚔️", label: "Battle" },
//     { id: "add", icon: "➕", label: "Add" },
//     { id: "achievements", icon: "🏆", label: "Awards" },
//   ];

//   return (
//     <View className="absolute bottom-0 left-0 right-0 bg-black/95 border-t-2 border-orange-600/30 flex-row justify-around px-5 pt-4 pb-8">
//       {navItems.map((item) => (
//         <TouchableOpacity
//           key={item.id}
//           onPress={() => onNavigate(item.id)}
//           className="items-center flex-1"
//         >
//           <Text
//             className={`text-2xl mb-1 ${activeScreen === item.id ? "opacity-100" : "opacity-50"}`}
//           >
//             {item.icon}
//           </Text>
//           <Text
//             className={`text-xs uppercase tracking-wide font-semibold ${
//               activeScreen === item.id ? "text-orange-400" : "text-gray-600"
//             }`}
//           >
//             {item.label}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }

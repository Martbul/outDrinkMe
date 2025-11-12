import { FlatList, View } from "react-native";

export default function MixVideo() {

       <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
         <FlatList
           data={videos}
           keyExtractor={(item) => item.id}
           contentContainerStyle={{
             paddingHorizontal: 16,
             paddingTop: 8,
             paddingBottom: 100,
           }}
           renderItem={renderVideoFeedItem}
           ListEmptyComponent={renderEmptyVideoComponent}
           showsVerticalScrollIndicator={false}
           snapToInterval={SCREEN_HEIGHT * 0.7 + 16}
           snapToAlignment="start"
           decelerationRate="fast"
           onViewableItemsChanged={onVideoViewableItemsChanged}
           viewabilityConfig={videoViewabilityConfig}
         />
       </View>
     
}
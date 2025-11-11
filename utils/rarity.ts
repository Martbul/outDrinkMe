  export const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "#d08700";
      case "Epic":
        return "#6e11b0";
      case "Rare":
        return "#193cb8";
      default:
        return "#9CA3AF";
    }
  };
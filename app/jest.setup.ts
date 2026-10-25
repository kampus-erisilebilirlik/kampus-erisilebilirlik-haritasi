jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// İkon fontu Jest'te yüklenemez; ikonlar zaten erişilebilirlik ağacından gizli
jest.mock("@expo/vector-icons/Ionicons", () => () => null);

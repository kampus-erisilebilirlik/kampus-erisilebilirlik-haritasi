// Ekip araçları (eğim ölçer) geliştirmede ve EXPO_PUBLIC_TEAM_TOOLS=1 ile derlenen saha build'inde görünür; #5'te admin oturumuna bağlanacak
export const teamToolsEnabled = __DEV__ || process.env.EXPO_PUBLIC_TEAM_TOOLS === "1";

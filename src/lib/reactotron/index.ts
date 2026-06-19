import AsyncStorage from "@react-native-async-storage/async-storage";
import Reactotron from "reactotron-react-native";
import {
  QueryClientManager,
  reactotronReactQuery,
} from "reactotron-react-query";

import { queryClient } from "@/lib/query";

// Observe the same module-scoped QueryClient the app renders with, so the
// React Query panel mirrors live cache state.
const queryClientManager = new QueryClientManager({ queryClient });

// biome-ignore lint/correctness/useHookAtTopLevel: `.use`/`.useReactNative` are Reactotron builder methods, not React hooks.
Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({
    name: "Art Keeper",
    onDisconnect: () => queryClientManager.unsubscribe(),
  })
  .use(reactotronReactQuery(queryClientManager))
  .useReactNative({
    // We want to see our own :3000 API traffic; only mute Metro symbolicate noise.
    networking: { ignoreUrls: /symbolicate/ },
  })
  .connect();

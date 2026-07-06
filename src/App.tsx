import { useAppStore } from "@/store/appStore";
import { BottomNav } from "@/components/BottomNav";
import { Home } from "@/screens/Home";
import { Explore } from "@/screens/Explore";
import { RoutineDetail } from "@/screens/RoutineDetail";
import { Record } from "@/screens/Record";
import { Profile } from "@/screens/Profile";
import { Curator } from "@/screens/Curator";

export default function App() {
  const screen = useAppStore((s) => s.screen);

  return (
    <div className="min-h-dvh bg-app flex flex-col">
      <div className="flex-1 overflow-y-auto app-scroll relative">
        {screen === "home" && <Home />}
        {screen === "explore" && <Explore />}
        {screen === "detail" && <RoutineDetail />}
        {screen === "record" && <Record />}
        {screen === "profile" && <Profile />}
        {screen === "curator" && <Curator />}
      </div>
      <BottomNav />
    </div>
  );
}

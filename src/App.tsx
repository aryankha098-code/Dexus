import NeuralBackground from "./components/NeuralBackground";
import CursorGlow from "./components/CursorGlow";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import { useVoiceAssistant } from "./hooks/useVoiceAssistant";

export default function App() {
  // One shared instance so the card's mute/reset buttons and the mic
  // button all act on the same conversation.
  const assistant = useVoiceAssistant();

  return (
    <div className="relative min-h-[100dvh] w-full bg-bg font-body text-white">
      <NeuralBackground />
      <CursorGlow />
      <Navigation />
      <Hero assistant={assistant} />
    </div>
  );
}

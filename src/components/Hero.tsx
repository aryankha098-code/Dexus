import AssistantCard from "./AssistantCard";
import type { useVoiceAssistant } from "../hooks/useVoiceAssistant";

interface HeroProps {
  assistant: ReturnType<typeof useVoiceAssistant>;
}

export default function Hero({ assistant }: HeroProps) {
  return (
    <section
      id="top"
      className="relative z-10 flex min-h-[100dvh] w-full items-center justify-center px-5 py-28 sm:px-8"
    >
      <div className="animate-reveal">
        <AssistantCard assistant={assistant} />
      </div>
    </section>
  );
}

// app/hello-world/page.tsx
import TextType from "@/ui/TextType";
export default function HelloWorldPage() {
  return (
    <h1 className="font-mono text-[3.5rem] sm:text-[4rem] lg:text-[4.75rem] leading-none tracking-[0.2em] font-semibold text-cyan-100 drop-shadow-[0_0_2px_rgba(34,211,238,0.7)] [text-shadow:0_0_2px_rgba(34,211,238,0.7),0_0_22px_rgba(34,211,238,0.35)]">
      <TextType 
        text={["Hello World!", "Veer's Crack'd Project"]}
        typingSpeed={75}
        pauseDuration={1500}
        showCursor
        cursorCharacter="_"
        deletingSpeed={50}
        variableSpeed={{ min: 60, max: 120 }}
        cursorBlinkDuration={0.5}
      />
    </h1>
  );
}

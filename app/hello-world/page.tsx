// app/hello-world/page.tsx
import TextType from "@/ui/TextType";
export default function HelloWorldPage() {
  return (
    <h1 className="text-[2.75rem] sm:text-[3.25rem] lg:text-[3.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 [font-family:var(--font-heading)]">
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

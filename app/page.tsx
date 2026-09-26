import { Inbox } from "@/components/inbox/inbox";
import { SetupNotice } from "@/components/setup-notice";
import { ThemeToggle } from "@/components/theme-toggle";
import { isAiConfigured } from "@/lib/ai/gemini";
import { getInbox } from "@/lib/reviews/get-inbox";

export default async function InboxPage() {
  const result = await getInbox();
  if (!result.ok) return <SetupNotice missing={result.missing} />;

  return (
    <Inbox
      locations={result.inbox.locations}
      reviews={result.inbox.reviews}
      aiConfigured={isAiConfigured()}
      themeToggle={<ThemeToggle />}
    />
  );
}

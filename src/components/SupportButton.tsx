import Icon from "./Icon";
import { SUPPORT_URL } from "@/lib/links";

/**
 * "Support the builder" link, styled as the gold counterpart to the TopBar's
 * "Star on GitHub". Rendered fixed in the bottom-right on the landing page.
 */
export default function SupportButton() {
  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="souls-focus flex cursor-pointer items-center gap-2 rounded-lg border border-gold/40 bg-void-2/80 px-4 py-2 font-display text-sm text-parchment/85 transition-colors hover:border-gold hover:text-gold sm:text-base"
    >
      <Icon name="coffee" className="h-5 w-5 text-gold" />
      <span>Support the builder</span>
    </a>
  );
}

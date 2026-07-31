import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { authorizeStoryAuthor } from "@/lib/auth/authorization";
import { isStoryStatus } from "@/lib/stories/status";
import { EditStoryPage } from "@/widgets/story-editor/edit-story-page";

export const metadata: Metadata = {
  title: "Редактирование произведения | Листория",
  description: "Редактирование произведения и его глав."
};

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authorization = await authorizeStoryAuthor(id);

  if (!authorization.story) {
    if (authorization.response.status === 401) {
      redirect(`/login?next=${encodeURIComponent(ROUTES.editWork(id))}`);
    }
    notFound();
  }

  if (!isStoryStatus(authorization.story.status)) {
    notFound();
  }

  return <EditStoryPage initialStory={{
    id: authorization.story.id,
    title: authorization.story.title,
    description: authorization.story.description,
    status: authorization.story.status,
    cover: authorization.story.cover,
    visibility: authorization.story.visibility,
    chapters: authorization.story.chapters.map((chapter) => ({ id: chapter.id, title: chapter.title, content: chapter.content }))
  }} />;
}

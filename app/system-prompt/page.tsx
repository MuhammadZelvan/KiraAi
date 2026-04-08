import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SystemPromptEditor } from "@/components/dashboard/SystemPromptEditor";

export default function SystemPromptPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Prompt</h1>
          <p className="text-muted-foreground mt-1">
            Customize how Lyra behaves and responds to all users.
          </p>
        </div>
        <SystemPromptEditor />
      </div>
    </DashboardLayout>
  );
}
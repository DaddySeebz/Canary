"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export function CreateProjectDialog({ triggerLabel = "Create Project" }: { triggerLabel?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error("Could not create project.");
      }

      const payload = (await response.json()) as { project?: { id: string } };
      const projectId = payload.project?.id;

      setOpen(false);
      setName("");
      setDescription("");
      toast.success("Project created.");
      if (projectId) {
        router.push(`/projects/${projectId}/audits`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create project.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Canary workspace</DialogTitle>
          <DialogDescription>
            Give the workspace a clear name. You can refine the description and monitoring rules after creation.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              placeholder="Quarter-end revenue integrity"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="What this dataset supports, who depends on it, and what goes wrong when it drifts."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || name.trim().length === 0}>
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export function ROIInputsDialog({
  projectId,
  initialValues,
}: {
  projectId: string;
  initialValues: {
    cost_per_error: number;
    time_per_fix_minutes: number;
    hourly_rate: number;
    volume_per_period: number;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch(`/api/projects/${projectId}/roi`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      toast.error("Could not save ROI settings.");
      setIsSaving(false);
      return;
    }

    toast.success("ROI settings updated.");
    setOpen(false);
    setIsSaving(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
        Edit ROI inputs
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ROI assumptions</DialogTitle>
          <DialogDescription>
            Canary keeps the estimates conservative. These inputs define the cost baseline.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Cost per error</Label>
            <Input
              type="number"
              min="0"
              value={values.cost_per_error}
              onChange={(event) => setValues((current) => ({ ...current, cost_per_error: Number(event.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Time per fix (minutes)</Label>
            <Input
              type="number"
              min="0"
              value={values.time_per_fix_minutes}
              onChange={(event) =>
                setValues((current) => ({ ...current, time_per_fix_minutes: Number(event.target.value) }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Hourly rate</Label>
            <Input
              type="number"
              min="0"
              value={values.hourly_rate}
              onChange={(event) => setValues((current) => ({ ...current, hourly_rate: Number(event.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Volume per period</Label>
            <Input
              type="number"
              min="0"
              value={values.volume_per_period}
              onChange={(event) =>
                setValues((current) => ({ ...current, volume_per_period: Number(event.target.value) }))
              }
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save assumptions"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

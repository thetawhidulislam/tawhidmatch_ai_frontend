"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { createJob, deleteJob, updateJob, type AdminJobInput } from "@/lib/admin";
import { getErrorMessage } from "@/lib/get-error-message";
import { listJobs } from "@/lib/jobs";
import type { Job } from "@/types";

const optionalNumber = z.preprocess(
  (value) => value === "" || value === undefined ? undefined : value,
  z.coerce.number().nonnegative().optional()
);

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(1, "Location is required"),
  jobType: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
  experienceLevel: z.string().min(1, "Experience level is required"),
  skills: z.string().min(1, "Add at least one skill"),
  salaryMin: optionalNumber,
  salaryMax: optionalNumber,
  status: z.enum(["OPEN", "CLOSED"]),
});

type JobFormValues = z.infer<typeof jobSchema>;

const defaultValues: JobFormValues = {
  title: "",
  company: "",
  description: "",
  location: "",
  jobType: "REMOTE",
  experienceLevel: "",
  skills: "",
  salaryMin: undefined,
  salaryMax: undefined,
  status: "OPEN",
};

function jobToFormValues(job: Job): JobFormValues {
  return {
    title: job.title,
    company: job.company,
    description: job.description,
    location: job.location,
    jobType: job.jobType,
    experienceLevel: job.experienceLevel,
    skills: job.skills.join(", "),
    salaryMin: job.salaryMin ?? undefined,
    salaryMax: job.salaryMax ?? undefined,
    status: job.status,
  };
}

function toJobInput(values: JobFormValues, includeStatus: boolean): AdminJobInput {
  const input: AdminJobInput = {
    title: values.title,
    company: values.company,
    description: values.description,
    location: values.location,
    jobType: values.jobType,
    experienceLevel: values.experienceLevel,
    skills: values.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
  };
  if (values.salaryMin !== undefined) input.salaryMin = values.salaryMin;
  if (values.salaryMax !== undefined) input.salaryMax = values.salaryMax;
  if (includeStatus) input.status = values.status;
  return input;
}

export default function AdminJobsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const jobsQuery = useQuery({
    queryKey: ["admin-jobs"],
    // The public endpoint may only return OPEN jobs; a dedicated admin list endpoint is out of scope for now.
    queryFn: () => listJobs({ limit: 100 }),
  });
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(editingJob ? jobToFormValues(editingJob) : defaultValues);
  }, [editingJob, form]);

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: AdminJobInput }) =>
      id ? updateJob(id, input) : createJob(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      setDialogOpen(false);
      setEditingJob(null);
      toast.success(editingJob ? "Job updated successfully" : "Job created successfully");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Job deleted successfully");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  const openCreate = () => {
    setEditingJob(null);
    form.reset(defaultValues);
    setDialogOpen(true);
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    form.reset(jobToFormValues(job));
    setDialogOpen(true);
  };

  const handleSubmit = (values: JobFormValues) => {
    saveMutation.mutate({
      id: editingJob?.id,
      input: toJobInput(values, Boolean(editingJob)),
    });
  };

  const handleDelete = (job: Job) => {
    if (window.confirm(`Delete ${job.title}?`)) deleteMutation.mutate(job.id);
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Manage Jobs" action={<Button onClick={openCreate}>Create Job</Button>} />

        {jobsQuery.isLoading ? (
          <LoadingGrid count={3} />
        ) : jobsQuery.isError ? (
          <ErrorState message={getErrorMessage(jobsQuery.error)} onRetry={() => jobsQuery.refetch()} />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobsQuery.data?.jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell><Badge variant="outline">{job.jobType}</Badge></TableCell>
                      <TableCell>
                        <Badge className={job.status === "OPEN" ? "bg-green-600 hover:bg-green-600" : "bg-muted text-muted-foreground hover:bg-muted"}>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(job)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(job)} disabled={deleteMutation.isPending}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job" : "Create Job"}</DialogTitle>
            <DialogDescription>{editingJob ? "Update the job details." : "Add a new opportunity to the platform."}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="company" render={({ field }) => <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="experienceLevel" render={({ field }) => <FormItem><FormLabel>Experience Level</FormLabel><FormControl><Input {...field} placeholder="Mid-level" /></FormControl><FormMessage /></FormItem>} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="jobType" render={({ field }) => <FormItem><FormLabel>Job Type</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="REMOTE">Remote</SelectItem><SelectItem value="ONSITE">Onsite</SelectItem><SelectItem value="HYBRID">Hybrid</SelectItem></SelectContent></Select><FormMessage /></FormItem>} />
                {editingJob && <FormField control={form.control} name="status" render={({ field }) => <FormItem><FormLabel>Status</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="OPEN">Open</SelectItem><SelectItem value="CLOSED">Closed</SelectItem></SelectContent></Select><FormMessage /></FormItem>} />}
              </div>
              <FormField control={form.control} name="skills" render={({ field }) => <FormItem><FormLabel>Skills</FormLabel><FormControl><Input {...field} placeholder="TypeScript, React, SQL" /></FormControl><FormMessage /></FormItem>} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="salaryMin" render={({ field }) => <FormItem><FormLabel>Minimum Salary</FormLabel><FormControl><Input type="number" min="0" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="salaryMax" render={({ field }) => <FormItem><FormLabel>Maximum Salary</FormLabel><FormControl><Input type="number" min="0" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : editingJob ? "Save Changes" : "Create Job"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
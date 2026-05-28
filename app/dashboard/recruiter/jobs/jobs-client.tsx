"use client";

import { useState, useTransition } from "react";
import { createJob, deleteJob } from "./actions";
import {
  Briefcase,
  Plus,
  Trash2,
  MapPin,
  Building2,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  type: string;
  companyName: string | null;
  location: string | null;
  description: string | null;
  createdAt: Date | null;
}

const typeLabels: Record<string, string> = {
  job: "Full-time",
  internship: "Internship",
};

export default function JobsClient({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [showForm, setShowForm] = useState(false);
  const [creating, startCreate] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (formData: FormData) => {
    startCreate(async () => {
      await createJob(formData);
      const form = document.getElementById(
        "create-job-form",
      ) as HTMLFormElement;
      form?.reset();
      setShowForm(false);
      window.location.reload();
    });
  };

  const handleDelete = (jobId: string) => {
    setDeletingId(jobId);
    startDelete(async () => {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            [ 10 ] postings
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
            <Briefcase className="h-5 w-5" />
            Manage Jobs
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {jobs.length} position{jobs.length !== 1 ? "s" : ""} posted
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-all hover:bg-zinc-100"
          style={{ boxShadow: "0 0 14px rgba(255,255,255,0.08)" }}
        >
          {showForm ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {showForm ? "Cancel" : "Post Job"}
        </button>
      </div>

      {showForm && (
        <form
          id="create-job-form"
          action={handleCreate}
          className="space-y-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-6 backdrop-blur-sm"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
        >
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
            New job posting
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job Title *">
              <input
                name="title"
                required
                placeholder="e.g. Senior Frontend Developer"
                className="w-full rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-600 backdrop-blur-sm transition-all focus:border-zinc-600/60 focus:outline-none"
              />
            </Field>

            <Field label="Type *">
              <div className="relative">
                <select
                  name="type"
                  className="w-full cursor-pointer appearance-none rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-3 text-sm text-white backdrop-blur-sm transition-all focus:border-zinc-600/60 focus:outline-none"
                >
                  <option value="job">Full-time</option>
                  <option value="internship">Internship</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              </div>
            </Field>

            <Field label="Company *">
              <input
                name="companyName"
                required
                placeholder="Company name"
                className="w-full rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-600 backdrop-blur-sm transition-all focus:border-zinc-600/60 focus:outline-none"
              />
            </Field>

            <Field label="Location">
              <input
                name="location"
                placeholder="e.g. Remote, Paris, New York"
                className="w-full rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-600 backdrop-blur-sm transition-all focus:border-zinc-600/60 focus:outline-none"
              />
            </Field>
          </div>

          <Field label="Description *">
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              className="w-full resize-none rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-600 backdrop-blur-sm transition-all focus:border-zinc-600/60 focus:outline-none"
            />
          </Field>

          <Field label="Requirements">
            <textarea
              name="requirements"
              rows={3}
              placeholder="List required skills, experience, education..."
              className="w-full resize-none rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-600 backdrop-blur-sm transition-all focus:border-zinc-600/60 focus:outline-none"
            />
          </Field>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-all hover:bg-zinc-100 disabled:opacity-50"
              style={!creating ? { boxShadow: "0 0 16px rgba(255,255,255,0.1)" } : undefined}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Publish Job
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800/60 py-16 text-center backdrop-blur-sm">
          <Briefcase className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
          <p className="font-medium text-zinc-400">No jobs posted yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            Post your first job opening above
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Active postings · {jobs.length}
          </p>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/70 hover:bg-zinc-900/50 sm:flex-row sm:items-start"
                style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/60 backdrop-blur-sm">
                  <Building2 className="h-5 w-5 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-white">
                      {job.title}
                    </h3>
                    <span className="rounded-full border border-zinc-700/50 bg-zinc-900/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 backdrop-blur-sm">
                      {typeLabels[job.type] ?? job.type}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-zinc-400">
                    {job.companyName ?? ""}
                  </p>
                  {job.location && (
                    <div className="mb-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </div>
                  )}
                  {job.description && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
                      {job.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(job.id)}
                  disabled={deleting && deletingId === job.id}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/[0.06] px-3 py-2 text-sm font-medium text-rose-300 backdrop-blur-sm transition-all hover:border-rose-400/60 hover:bg-rose-500/10 disabled:opacity-50"
                  style={{ boxShadow: "0 0 12px rgba(248,113,113,0.08)" }}
                >
                  {deleting && deletingId === job.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}

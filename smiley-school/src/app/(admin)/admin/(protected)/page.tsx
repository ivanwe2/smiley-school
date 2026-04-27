import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { startOfWeek, addDays } from "date-fns";
import {
  CalendarDays,
  FileText,
  Mail,
  Images,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardStats() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const [
    totalClasses,
    publishedPosts,
    draftPosts,
    totalAlbums,
    unreadContacts,
    recentContacts,
    thisWeekOverrides,
  ] = await Promise.all([
    db.class.count({ where: { isActive: true } }),
    db.post.count({ where: { published: true } }),
    db.post.count({ where: { published: false } }),
    db.galleryAlbum.count({ where: { published: true } }),
    db.contactSubmission.count({ where: { read: false } }),
    db.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.classOverride.count({
      where: { date: { gte: weekStart, lte: weekEnd } },
    }),
  ]);

  return {
    totalClasses,
    publishedPosts,
    draftPosts,
    totalAlbums,
    unreadContacts,
    recentContacts,
    thisWeekOverrides,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const STAT_CARDS = [
    {
      label: "Active Classes",
      value: stats.totalClasses,
      icon: CalendarDays,
      href: "/admin/schedule",
      note: stats.thisWeekOverrides > 0 ? `${stats.thisWeekOverrides} change${stats.thisWeekOverrides > 1 ? "s" : ""} this week` : "No changes this week",
      color: "bg-[var(--navy-deep)]",
    },
    {
      label: "Published Posts",
      value: stats.publishedPosts,
      icon: FileText,
      href: "/admin/posts",
      note: stats.draftPosts > 0 ? `${stats.draftPosts} draft${stats.draftPosts > 1 ? "s" : ""}` : "All published",
      color: "bg-[var(--navy-mid)]",
    },
    {
      label: "Gallery Albums",
      value: stats.totalAlbums,
      icon: Images,
      href: "/admin/gallery",
      note: "Published albums",
      color: "bg-[var(--yellow-deep)]",
    },
    {
      label: "Unread Messages",
      value: stats.unreadContacts,
      icon: Mail,
      href: "/admin/contacts",
      note: stats.unreadContacts > 0 ? "Needs attention" : "All caught up ✓",
      color: stats.unreadContacts > 0 ? "bg-red-500" : "bg-[var(--success)]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-fraunces font-semibold text-[var(--navy-deep)]">
            Dashboard
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">
            {formatDate(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white text-sm font-medium text-[var(--navy-mid)] hover:bg-[var(--navy-light)] transition-colors"
        >
          View site <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, href, note, color }) => (
          <Link
            key={label}
            href={href}
            className="group bg-white rounded-2xl border border-[var(--border)] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl sm:text-3xl font-fraunces font-bold text-[var(--navy-deep)]">
              {value}
            </p>
            <p className="text-sm font-medium text-[var(--navy-mid)] mt-0.5">{label}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{note}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-3 bg-white rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--yellow-primary)] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--yellow-light)] flex items-center justify-center shrink-0">
            <FileText size={18} className="text-[var(--yellow-deep)]" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--navy-deep)] group-hover:text-[var(--yellow-deep)] transition-colors">
              Write new post
            </p>
            <p className="text-xs text-[var(--text-muted)]">News, events, graduations</p>
          </div>
        </Link>
        <Link
          href="/admin/schedule"
          className="flex items-center gap-3 bg-white rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--yellow-primary)] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--navy-light)] flex items-center justify-center shrink-0">
            <CalendarDays size={18} className="text-[var(--navy-deep)]" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--navy-deep)] group-hover:text-[var(--yellow-deep)] transition-colors">
              Manage schedule
            </p>
            <p className="text-xs text-[var(--text-muted)]">Add classes, mark cancellations</p>
          </div>
        </Link>
        <Link
          href="/admin/contacts"
          className="flex items-center gap-3 bg-white rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--yellow-primary)] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--navy-light)] flex items-center justify-center shrink-0">
            <Mail size={18} className="text-[var(--navy-deep)]" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--navy-deep)] group-hover:text-[var(--yellow-deep)] transition-colors">
              View messages
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {stats.unreadContacts > 0
                ? `${stats.unreadContacts} unread message${stats.unreadContacts > 1 ? "s" : ""}`
                : "No unread messages"}
            </p>
          </div>
        </Link>
      </div>

      {/* Recent contact submissions */}
      {stats.recentContacts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[var(--navy-mid)]" />
              <h2 className="font-fraunces font-semibold text-[var(--navy-deep)] text-sm">
                Recent enquiries
              </h2>
            </div>
            <Link
              href="/admin/contacts"
              className="text-xs text-[var(--yellow-deep)] font-semibold hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {stats.recentContacts.map((c) => (
              <div key={c.id} className={`flex items-center gap-3 px-5 py-3.5 ${!c.read ? "bg-[var(--yellow-light)]/20" : ""}`}>
                {!c.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--yellow-primary)] shrink-0" />
                )}
                {c.read && <span className="w-1.5 h-1.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm text-[var(--navy-deep)]">{c.name}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-2">{c.email}</span>
                </div>
                <span className="text-xs text-[var(--text-muted)] shrink-0 hidden sm:block">
                  {formatDate(c.createdAt, "MMM d")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

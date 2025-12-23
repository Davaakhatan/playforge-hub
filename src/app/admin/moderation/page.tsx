'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn, formatDistanceToNow } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Report {
  id: string;
  type: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: {
    id: string;
    username: string;
    avatar: string | null;
  };
  reportedUser: {
    id: string;
    username: string;
    avatar: string | null;
  } | null;
  game: {
    id: string;
    slug: string;
    title: string;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  reviewed: 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-green-500/20 text-green-400',
  dismissed: 'bg-zinc-500/20 text-zinc-400',
};

const TYPE_ICONS: Record<string, string> = {
  user: '👤',
  game: '🎮',
  comment: '💬',
  bug: '🐛',
};

export default function ModerationPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchReports();
    }
  }, [user, statusFilter, page]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/reports?status=${statusFilter}&page=${page}`
      );
      const data = await response.json();
      if (response.ok) {
        setReports(data.reports);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (
    reportId: string,
    status: string,
    action?: { type: string; message?: string }
  ) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status, action }),
      });

      if (response.ok) {
        fetchReports();
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Failed to update report:', error);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">
          You don&apos;t have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Moderation</h1>
        <p className="mt-2 text-zinc-400">Review and manage user reports</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['pending', 'reviewed', 'resolved', 'dismissed', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors',
              statusFilter === status
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-zinc-800 p-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded bg-zinc-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 rounded bg-zinc-700" />
                  <div className="h-4 w-full rounded bg-zinc-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-lg bg-zinc-800 p-12 text-center">
          <p className="text-zinc-400">No reports found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className={cn(
                'rounded-lg border bg-zinc-800 p-4 transition-colors',
                selectedReport?.id === report.id
                  ? 'border-blue-500'
                  : 'border-zinc-700 hover:border-zinc-600'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700 text-xl">
                    {TYPE_ICONS[report.type] || '📋'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                          STATUS_COLORS[report.status]
                        )}
                      >
                        {report.status}
                      </span>
                      <span className="text-sm text-zinc-500 capitalize">
                        {report.type} Report
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-white">{report.reason}</p>
                    {report.details && (
                      <p className="mt-1 text-sm text-zinc-400">{report.details}</p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                      <span>
                        Reported by{' '}
                        <Link
                          href={`/users/${report.reporter.username}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {report.reporter.username}
                        </Link>
                      </span>
                      {report.reportedUser && (
                        <span>
                          Against{' '}
                          <Link
                            href={`/users/${report.reportedUser.username}`}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {report.reportedUser.username}
                          </Link>
                        </span>
                      )}
                      {report.game && (
                        <span>
                          Game:{' '}
                          <Link
                            href={`/games/${report.game.slug}`}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {report.game.title}
                          </Link>
                        </span>
                      )}
                      <span>{formatDistanceToNow(new Date(report.createdAt))}</span>
                    </div>
                  </div>
                </div>

                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      Review
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateReportStatus(report.id, 'dismissed')}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-zinc-900 p-6">
            <h3 className="text-lg font-bold text-white">Review Report</h3>
            <p className="mt-2 text-zinc-400">{selectedReport.reason}</p>
            {selectedReport.details && (
              <p className="mt-2 text-sm text-zinc-500">{selectedReport.details}</p>
            )}

            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-white">Actions</h4>

              {selectedReport.type === 'comment' && (
                <Button
                  className="w-full"
                  onClick={() =>
                    updateReportStatus(selectedReport.id, 'resolved', {
                      type: 'hide_comment',
                    })
                  }
                >
                  Hide Comment & Resolve
                </Button>
              )}

              {selectedReport.type === 'game' && (
                <Button
                  className="w-full"
                  onClick={() =>
                    updateReportStatus(selectedReport.id, 'resolved', {
                      type: 'hide_game',
                    })
                  }
                >
                  Hide Game & Resolve
                </Button>
              )}

              {selectedReport.reportedUser && (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() =>
                    updateReportStatus(selectedReport.id, 'resolved', {
                      type: 'warn_user',
                      message: 'Your content has been reported and reviewed by moderators.',
                    })
                  }
                >
                  Warn User & Resolve
                </Button>
              )}

              <Button
                className="w-full"
                variant="secondary"
                onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
              >
                Mark as Resolved (No Action)
              </Button>

              <Button
                className="w-full"
                variant="secondary"
                onClick={() => setSelectedReport(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

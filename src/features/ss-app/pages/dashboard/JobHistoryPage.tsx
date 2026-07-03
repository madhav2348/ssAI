import { useEffect, useState } from 'react'

type Job = {
  id: string
  status: string
  stage: string | null
  createdAt: string
  updatedAt: string
}

export function JobHistoryPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    async function load() {
      try {
        const res = await fetch('/api/screenshots')
        const data = await res.json()
        setJobs(data)
      } finally {
        setLoading(false)
      }
    }

    load()
    interval = setInterval(load, 3000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <p>Loading jobs...</p>
  }

  return (
    <div className="job-history-page">
      <h3>Job History</h3>

      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
          {/* HEADER */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              fontWeight: 'bold',
            }}
          >
            <span>Job ID</span>
            <span>Status</span>
            <span>Stage</span>
            <span>Updated</span>
          </div>

          {/* ROWS */}
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                padding: '8px 0',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
              }}
            >
              <span>{job.id.slice(0, 10)}...</span>

              <span>
                {job.status === 'processed' && 'processed'}
                {job.status === 'processing' && 'processing'}
                {job.status === 'queued' && 'queued'}
                {job.status === 'failed' && 'failed'}
              </span>

              <span>{job.stage ?? '-'}</span>

              <span>{new Date(job.updatedAt).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* DETAILS PANEL */}
      {selectedJob ? (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            background: '#fafafa',
          }}
        >
          <h4>Job Details</h4>

          <p>
            <strong>Job ID:</strong> {selectedJob.id}
          </p>
          <p>
            <strong>Status:</strong> {selectedJob.status}
          </p>
          <p>
            <strong>Stage:</strong> {selectedJob.stage ?? '-'}
          </p>
          <p>
            <strong>Created:</strong>{' '}
            {new Date(selectedJob.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Updated:</strong>{' '}
            {new Date(selectedJob.updatedAt).toLocaleString()}
          </p>

          {/* Export XLSX link */}
          <div style={{ marginTop: '12px' }}>
            <a
              href={`/api/screenshots/${selectedJob.id}/export/xlsx`}
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                background: '#1f2937',
                color: '#fff',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              Export XLSX
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}

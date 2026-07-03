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
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [exportingJobId, setExportingJobId] = useState<string | null>(null)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    async function load() {
      try {
        const res = await fetch('/api/screenshots')

        if (!res.ok) {
          throw new Error('Failed to load jobs')
        }

        const data = await res.json()
        setJobs(data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Failed to load jobs.')
      } finally {
        setLoading(false)
      }
    }

    load()
    interval = setInterval(load, 3000)

    return () => clearInterval(interval)
  }, [])

  async function handleExport(jobId: string) {
    try {
      setExportingJobId(jobId)

      const response = await fetch(`/api/screenshots/${jobId}/export/xlsx`)

      if (!response.ok) {
        throw new Error('Failed to export XLSX')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `screenshot-${jobId}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Failed to export XLSX file.')
    } finally {
      setExportingJobId(null)
    }
  }

  if (loading) {
    return <p>Loading jobs...</p>
  }

  if (error && jobs.length === 0) {
    return <p>{error}</p>
  }

  return (
    <div className="job-history-page">
      <h3>Job History</h3>

      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
              fontWeight: 'bold',
            }}
          >
            <span>Job ID</span>
            <span>Status</span>
            <span>Stage</span>
            <span>Updated</span>
            <span>Export</span>
          </div>

          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
                padding: '8px 0',
                borderBottom: '1px solid #eee',
                alignItems: 'center',
              }}
            >
              <span
                onClick={() => setSelectedJob(job)}
                style={{ cursor: 'pointer' }}
              >
                {job.id.slice(0, 10)}...
              </span>

              <span>
                {job.status === 'processed' && 'processed'}
                {job.status === 'processing' && 'processing'}
                {job.status === 'queued' && 'queued'}
                {job.status === 'failed' && 'failed'}
              </span>

              <span>{job.stage ?? '-'}</span>
              <span>{new Date(job.updatedAt).toLocaleTimeString()}</span>

              <button
                onClick={() => handleExport(job.id)}
                disabled={exportingJobId === job.id}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: exportingJobId === job.id ? '#f3f3f3' : '#fff',
                  cursor: exportingJobId === job.id ? 'not-allowed' : 'pointer',
                }}
              >
                {exportingJobId === job.id ? 'Exporting...' : 'Download XLSX'}
              </button>
            </div>
          ))}
        </div>
      )}

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
            <strong>Created:</strong> {new Date(selectedJob.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Updated:</strong> {new Date(selectedJob.updatedAt).toLocaleString()}
          </p>
        </div>
      ) : null}
    </div>
  )
}

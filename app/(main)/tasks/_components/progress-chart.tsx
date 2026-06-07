import { getProgressOverTime } from '../queries'
import { ProgressChartView } from './progress-chart-view'

interface ProgressChartProps {
  projectId: string
}

export async function ProgressChart({ projectId }: ProgressChartProps) {
  const series = await getProgressOverTime(projectId)

  return <ProgressChartView data={series} />
}
